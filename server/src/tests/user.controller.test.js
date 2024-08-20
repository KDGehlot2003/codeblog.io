const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const {app} = require('../app');
const connectDB = require('../db/index')
const User = require('../models/user.model');
const fs = require('fs').promises;
const path = require('path');
const { head } = require('../routes/user.routes');
const { profile } = require('console');
const { text } = require('express');
const { upload } = require('../middlewares/multer.middleware');

let mongoServer;
let createUserId;
let server;


async function cleanupUploads() {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  try {
    const files = await fs.readdir(uploadsDir);
    for (const file of files) {
      await fs.unlink(path.join(uploadsDir, file));
    }
  } catch (error) {
    console.log("Error cleaning up uploads", error);
  }
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create(); // ERROR
  const mongoUri = mongoServer.getUri();

  await connectDB(mongoUri);
  console.log('Connected to in-memory database');

  server = app.listen(8001);
  console.log(`Server started on port 8001`);
});

afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    console.log('Server stopped');
  }
  if (mongoServer) {
    await mongoServer.stop();
    console.log('MongoDB stopped');
  }
  // await cleanupUploads();
});

// describe('User Controller', () => {
//   describe('registerUser', () => {
//     it('should register a new user and return user details', async () => {
//         const mockUser = {
//             _id: '123',
//             fullName: 'John Doe',
//             profileImage: 'http://cloudinary.com/image.jpg',
//             email: 'john@example.com',
//             username: 'johndoe',
//             save: jest.fn(),
//         };

//         User.findOne.mockResolvedValue(null);
//         uploadOnCloudinary.mockResolvedValue({ url: 'http://cloudinary.com/image.jpg' });
//         User.create.mockResolvedValue(mockUser);
//         User.findById.mockResolvedValue(mockUser);

//         const res = await request(app)
//             .post('/api/users/register')
//             .send({
//                 fullName: 'John Doe',
//                 email: 'john@example.com',
//                 username: 'johndoe',
//                 password: 'password123',
//             });

//         expect(res.status).toBe(201);
//         expect(res.body).toEqual(new ApiResponse(200, mockUser, "User register Successfully..."));
//     })
// })


console.log(86);

  describe('registerUser', () => {
    console.log(89);
    
    it('should register a new user and return user details', async () => {
      console.log(92);
      
      // const mockUser = {
      //   fullName: 'John Doe',
      //   profileImage: 'http://cloudinary.com/image.jpg',
      //   email: 'john@exmaple.com',
      //   username: 'johndoe',
      //   save: jest.fn(),
      // };

      // User.findOne.mockResolvedValue(null);
      // uploadOnCloudinary.mockResolvedValue({ url: 'http://cloudinary.com/image.jpg' });
      // User.create.mockResolvedValue(mockUser);
      // User.findById.mockResolvedValue(mockUser);

      const res = await request(app)

        .post('/api/v1/users/register')  
        .send({
          fullName: '234 Doe',
          email: 'ewr@example.com',
          username: 'dfsggfd',
          password: "123445"
        });

      expect(res.status).toBe(201);
      // expect(res.body).toEqual(new ApiResponse(200, mockUser, "User register Successfully..."));
    })
  })

