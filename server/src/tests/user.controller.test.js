const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../app');
const connectDB = require('../db/index');

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
    server = app.listen(8001, () => {
        console.log('Server started on port 8001');
    });
});

afterAll(async () => {
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
    // await cleanupUploads();
    console.log('Finished cleanup in afterAll');
});

describe('registerUser', () => {
    const mockUser = {
        fullName: 'John Doe9',
        email: 'johndoe9@example.com',
        username: 'JohnDoe9',
        password: "abcdefghi"
    }

    test('Negative test when any field is empty', async () => {
        const invalidUser = { ...mockUser, email: '' }; // Email is empty
        const res = await request(app)
            .post('/api/v1/users/register')
            .send(invalidUser);
        // console.log("\n\n\n",res);
        expect(res.status).toBe(400);
        // expect(res.body).toHaveProperty('message', 'All fields required');

    });

    test('Negative test when password is less than 6 characters', async () => {
        const invalidUser = { ...mockUser, password: '12345' }; // Password too short
        const res = await request(app)
            .post('/api/v1/users/register')
            .send(invalidUser);

        expect(res.status).toBe(400);
        // expect(res.body).toHaveProperty('message', 'Password should be at least 6 characters long');
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
        // expect(res.body).toHaveProperty('message', 'User with email or username already exists');
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
        // expect(res.body).toHaveProperty('message', 'User with email or username already exists');
    });

    positivemockUser = {
        fullName: 'Kshitij2',
        email: 'kd2@gmail.com',
        username: 'kd2',
        password: "kd123456"
    }
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
    });


});


describe('loginUser', () => {
    const mockUser = {
        email: 'johndoe9@example.com',
        username: 'JohnDoe9',
        password: "abcdefghi"
    }
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
        // expect(res.body).toHaveProperty('data');
        // expect(res.body.data).toHaveProperty('accessToken');
        // expect(res.body.data).toHaveProperty('refreshToken');
    });
});































// const request = require('supertest');
// const mongoose = require('mongoose');
// const { MongoMemoryServer } = require('mongodb-memory-server');
// const {app} = require('../app');
// const connectDB = require('../db/index')
// const User = require('../models/user.model');
// const fs = require('fs').promises;
// const path = require('path');
// const { head } = require('../routes/user.routes');
// const { profile } = require('console');
// const { text } = require('express');
// const { upload } = require('../middlewares/multer.middleware');

// let mongoServer;
// let createUserId;
// let server;


// async function cleanupUploads() {
//   const uploadsDir = path.join(__dirname, '..', 'uploads');
//   try {
//     const files = await fs.readdir(uploadsDir);
//     for (const file of files) {
//       await fs.unlink(path.join(uploadsDir, file));
//     }
//   } catch (error) {
//     console.log("Error cleaning up uploads", error);
//   }
// }

// beforeAll(async () => {
//   mongoServer = await MongoMemoryServer.create(); // ERROR
//   const mongoUri = mongoServer.getUri();

//   await connectDB(mongoUri);
//   console.log('Connected to in-memory database');

//   server = app.listen(8001);
//   console.log(`Server started on port 8001`);
// });

// afterAll(async () => {
//   if (server) {
//     await new Promise((resolve) => server.close(resolve));
//     console.log('Server stopped');
//   }
//   if (mongoServer) {
//     await mongoServer.stop();
//     console.log('MongoDB stopped');
//   }
//   // await cleanupUploads();
// });

// // describe('User Controller', () => {
// //   describe('registerUser', () => {
// //     it('should register a new user and return user details', async () => {
// //         const mockUser = {
// //             _id: '123',
// //             fullName: 'John Doe',
// //             profileImage: 'http://cloudinary.com/image.jpg',
// //             email: 'john@example.com',
// //             username: 'johndoe',
// //             save: jest.fn(),
// //         };

// //         User.findOne.mockResolvedValue(null);
// //         uploadOnCloudinary.mockResolvedValue({ url: 'http://cloudinary.com/image.jpg' });
// //         User.create.mockResolvedValue(mockUser);
// //         User.findById.mockResolvedValue(mockUser);

// //         const res = await request(app)
// //             .post('/api/users/register')
// //             .send({
// //                 fullName: 'John Doe',
// //                 email: 'john@example.com',
// //                 username: 'johndoe',
// //                 password: 'password123',
// //             });

// //         expect(res.status).toBe(201);
// //         expect(res.body).toEqual(new ApiResponse(200, mockUser, "User register Successfully..."));
// //     })
// // })


// console.log(86);

//   describe('registerUser', () => {
//     console.log(89);
    
//     it('should register a new user and return user details', async () => {
//       console.log(92);
      
//       // const mockUser = {
//       //   fullName: 'John Doe',
//       //   profileImage: 'http://cloudinary.com/image.jpg',
//       //   email: 'john@exmaple.com',
//       //   username: 'johndoe',
//       //   save: jest.fn(),
//       // };

//       // User.findOne.mockResolvedValue(null);
//       // uploadOnCloudinary.mockResolvedValue({ url: 'http://cloudinary.com/image.jpg' });
//       // User.create.mockResolvedValue(mockUser);
//       // User.findById.mockResolvedValue(mockUser);

//       const res = await request(app)

//         .post('/api/v1/users/register')  
//         .send({
//           fullName: 'kd',
//           email: 'kd@gmail.com',
//           username: 'kd',
//           password: "kd123"
//         });

//       expect(res.status).toBe(201);
//       // expect(res.body).toEqual(new ApiResponse(200, mockUser, "User register Successfully..."));
//     })
//   })

