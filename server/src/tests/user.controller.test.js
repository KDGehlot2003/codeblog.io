const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { app } = require('../app');
const connectDB = require('../db/index');
const User = require('../models/user.model');

let mongoServer;
let server;
let accessToken;
let refreshToken;

const mockUser = {
    fullName: 'Kishan Kumar',
    email: 'kk4@gmail.com',
    username: 'kk4',
    password: "kk124456"
};

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await connectDB(mongoUri);

    server = app.listen(8002, () => {
        console.log('Server started on port 8002');
    });

    // Register user to obtain tokens for further tests
    const res = await request(app)
        .post('/api/v1/users/register')
        .send(mockUser);
    const loginRes = await request(app)
        .post('/api/v1/users/login')
        .send({ username: mockUser.username, password: mockUser.password });

    accessToken = loginRes.body.data.accessToken;
    refreshToken = loginRes.body.data.refreshToken;
});

afterAll(async () => {
    await User.deleteMany({});
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
});

describe('User Registration', () => {
    const mockUser1 = {
        fullName: 'John Doe11',
        email: 'johndoe11@example.com',
        username: 'JohnDoe11',
        password: "abcdefghi"
    };

    test('Positive Test: User Registration Success', async () => {
        const res = await request(app)
            .post('/api/v1/users/register')
            .send(mockUser1);
        
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('message', 'User register Successfully...');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('username', mockUser1.username.toLowerCase());
        expect(res.body.data).toHaveProperty('email', mockUser1.email);
        expect(res.body.data).toHaveProperty('fullName', mockUser1.fullName);

        const user = await User.findOne({ email: mockUser1.email });
        expect(user).not.toBeNull();
        expect(user.fullName).toBe(mockUser1.fullName);
        expect(user.email).toBe(mockUser1.email);
        expect(user.username).toBe(mockUser1.username.toLowerCase());
    }, 2000);

    test('Negative Test: User Registration with Empty Email', async () => {
        const invalidUser = { ...mockUser1, email: '' }; // Email is empty
        const res = await request(app)
            .post('/api/v1/users/register')
            .send(invalidUser);
        expect(res.status).toBe(400);
        // expect(res.body).toHaveProperty('message', 'Email is required');
    }, 2000);

    test('Negative Test: User Registration with Short Password', async () => {
        const invalidUser = { fullName:'Kishan Kumar', email:'aasdfs@gmail.com',password:'advcs',username:'kkksdf'}; // Password too short
        const res = await request(app)
            .post('/api/v1/users/register')
            .send(invalidUser);
        expect(res.status).toBe(400);
        // expect(res.body).toHaveProperty('message', 'Password must be at least 6 characters long');
    }, 2000);

    test('Negative Test: User Registration with Duplicate Email', async () => {
        // Attempt to register with the same email
        const res = await request(app)
            .post('/api/v1/users/register')
            .send({ ...mockUser1, username: 'newusername' });
        expect(res.status).toBe(409);
        // Uncomment the line below once error messages are implemented in the API
        // expect(res.body).toHaveProperty('message', 'User with this email already exists');
    }, 2000);

    test('Negative Test: User Registration with Duplicate Username', async () => {

        // Attempt to register with the same username
        const res = await request(app)
            .post('/api/v1/users/register')
            .send({ ...mockUser1, email: 'newemail@example.com' });
        expect(res.status).toBe(409);
        // Uncomment the line below once error messages are implemented in the API
        // expect(res.body).toHaveProperty('message', 'User with this username already exists');
    }, 2000);

    test('Edge Case: User Registration with Extremely Large Username', async () => {
        const largeUsername = 'u'.repeat(1000); // Extremely large username
        const res = await request(app)
            .post('/api/v1/users/register')
            .send({ ...mockUser1, username: largeUsername });
        expect(res.status).toBe(400);
        // Uncomment the line below once error messages are implemented in the API
        // expect(res.body).toHaveProperty('message', 'Username is too long');
    }, 2000);

    test('Edge Case: User Registration with Special Characters in Email', async () => {
        const specialCharEmail = 'special!#$%&\'*+/=?^_`{|}~@example.com';
        const res = await request(app)
            .post('/api/v1/users/register')
            .send({ ...mockUser1, email: specialCharEmail });
        expect(res.status).toBe(400);
        // Uncomment the line below once error messages are implemented in the API
        // expect(res.body).toHaveProperty('message', 'Invalid email format');
    }, 2000);
});

describe('User Login', () => {
    test('Positive Test: User Login Success', async () => {
        // Login user
        const res = await request(app)
            .post('/api/v1/users/login')
            .send({ username: mockUser.username, password: mockUser.password });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'User logged In Successfully...');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('accessToken');
        expect(res.body.data).toHaveProperty('refreshToken');
        
        accessToken = res.body.data.accessToken;
        refreshToken = res.body.data.refreshToken;
    }, 20000);

    test('Edge Case: User Login with Invalid Username', async () => {
        const res = await request(app)
            .post('/api/v1/users/login')
            .send({ username: 'invalidUser', password: mockUser.password });
        expect(res.status).toBe(404);
        // Uncomment the line below once error messages are implemented in the API
        // expect(res.body).toHaveProperty('message', 'Invalid username or password');
    }, 2000);

    test('Edge Case: User Login with Invalid Password', async () => {
        const res = await request(app)
            .post('/api/v1/users/login')
            .send({ username: mockUser.username, password: 'wrongPassword' });
        expect(res.status).toBe(401);
        // Uncomment the line below once error messages are implemented in the API
        // expect(res.body).toHaveProperty('message', 'Invalid username or password');
    }, 2000);
});

describe('User Logout', () => {
    test('Positive Test: User Logout Success with Valid Token', async () => {
        const res = await request(app)
            .post('/api/v1/users/logout')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'User logged Out');
    });

    test('Negative Test: User Logout Without Token', async () => {
        const res = await request(app)
            .post('/api/v1/users/logout');

        expect(res.status).toBe(401);
        // expect(res.body).toHaveProperty('message', 'Token is required');
    });

    test('Negative Test: User Logout with Invalid Token', async () => {
        const res = await request(app)
            .post('/api/v1/users/logout')
            .set('Authorization', 'Bearer invalidToken');

        expect(res.status).toBe(401);
        // expect(res.body).toHaveProperty('message', 'Invalid token');
    });
});
