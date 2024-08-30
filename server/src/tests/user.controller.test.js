const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { app } = require('../app');
const connectDB = require('../db/index');
const User = require('../models/user.model'); // Assuming you have a User model

let mongoServer;
let server;

beforeAll(async () => {
    console.log('Starting MongoMemoryServer...');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log('MongoMemoryServer started.');

    console.log('Connecting to in-memory database...');
    await connectDB(mongoUri);
    console.log('Connected to in-memory database');

    console.log('Starting server...');
    server = app.listen(8002, () => {
        console.log('Server started on port 8002');
    });
});

afterAll(async () => {
    await User.deleteMany({});
    console.log('Closing server...');
    if (server) {
        await new Promise((resolve) => server.close(resolve));
        console.log('Server stopped');
    }

    console.log('Stopping MongoMemoryServer...');
    if (mongoServer) {
        await mongoServer.stop();
        console.log('MongoMemoryServer stopped');
    }
    console.log('Finished cleanup in afterAll');
});

// afterEach(async () => {
//     
// });

describe('registerUser', () => {
    const mockUser = {
        fullName: 'John Doe11',
        email: 'johndoe11@example.com',
        username: 'JohnDoe11',
        password: "abcdefghi"
    };

    test('Negative test when any field is empty', async () => {
        const invalidUser = { ...mockUser, email: '' }; // Email is empty
        const res = await request(app)
            .post('/api/v1/users/register')
            .send(invalidUser);
        expect(res.status).toBe(400);
    });

    test('Negative test when password is less than 6 characters', async () => {
        const invalidUser = { ...mockUser, password: '12345' }; // Password too short
        const res = await request(app)
            .post('/api/v1/users/register')
            .send(invalidUser);
        expect(res.status).toBe(400);
    });

    test('Negative test when user with the same email already exists', async () => {
        // First registration
        await request(app)
            .post('/api/v1/users/register')
            .send(mockUser);

        // Attempt to register with the same email
        const res = await request(app)
            .post('/api/v1/users/register')
            .send({ ...mockUser, username: 'newusername' });
        expect(res.status).toBe(409);
    });

    test('Negative test when user with the same username already exists', async () => {
        // First registration
        await request(app)
            .post('/api/v1/users/register')
            .send(mockUser);

        // Attempt to register with the same username
        const res = await request(app)
            .post('/api/v1/users/register')
            .send({ ...mockUser, email: 'newemail@example.com' });
        expect(res.status).toBe(409);
    });

    const positivemockUser = {
        fullName: 'Kshitij4',
        email: 'kd4@gmail.com',
        username: 'kd4',
        password: "kd124456"
    };

    test('Positive test on registering user successfully', async () => {
        console.log('Sending request to register user...');
        const res = await request(app)
            .post('/api/v1/users/register')
            .send(positivemockUser);
        console.log('Request completed. Checking response...');

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe('User register Successfully...');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('username');
        expect(res.body.data).toHaveProperty('email');
        expect(res.body.data).toHaveProperty('fullName');
        expect(res.body.data.username).toBe(positivemockUser.username.toLowerCase());
        expect(res.body.data.email).toBe(positivemockUser.email);
        expect(res.body.data.fullName).toBe(positivemockUser.fullName);

        // Query the database to check if the user data is stored
        const user = await User.findOne({ email: positivemockUser.email });
        expect(user).not.toBeNull();
        expect(user.fullName).toBe(positivemockUser.fullName);
        expect(user.email).toBe(positivemockUser.email);
        expect(user.username).toBe(positivemockUser.username.toLowerCase());
    }, 20000); // Increase timeout to 20 seconds
});

describe('loginUser', () => {
    const mockUser = {
        fullName: 'Kishan Kumar',
        email: 'kk4@gmail.com',
        username: 'kk4',
        password: "kk124456"
    };

    test('Positive test on logging in user successfully', async () => {
        // Register user first
        // await request(app)
        //     .post('/api/v1/users/register')
        //     .send(mockUser);

        // Login user
        const res = await request(app)
            .post('/api/v1/users/login')
            .send({ username: mockUser.username, password: mockUser.password });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'User logged In Successfully...');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('accessToken');
        expect(res.body.data).toHaveProperty('refreshToken');
    }, 20000); // Increase timeout to 20 seconds
});