const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { app } = require('../app');
const connectDB = require('../db/index');
const Blog = require('../models/blog.model');
const User = require('../models/user.model');
const path = require('path');
const fs = require('fs');

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

const mockBlog = {
    title: 'Sample Blog Title',
    content: 'This is the content of the sample blog.',
    category:'DSA'
};

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await connectDB(mongoUri);

    server = app.listen(8001, () => {
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
    await Blog.deleteMany({});
    await User.deleteMany({});
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
});

describe('Blog Endpoints', () => {
    test('Positive Test: Create Blog Successfully', async () => {
        // const thumbnailPath = path.join(__dirname, 'assets', 'thumbnail.jpg');
        

        const res = await request(app)
            .post('/api/v1/blogs/')
            .set('Authorization', `Bearer ${accessToken}`)
            .field('title', mockBlog.title)
            .field('content', mockBlog.content)
            .field('category',mockBlog.category);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('message', 'Blog created successfully');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('title', mockBlog.title);
        expect(res.body.data).toHaveProperty('content', mockBlog.content);

        const blog = await Blog.findOne({ title: mockBlog.title });
        expect(blog).not.toBeNull();
        expect(blog.title).toBe(mockBlog.title);
        expect(blog.content).toBe(mockBlog.content)
        expect(blog.category).toBe(mockBlog.category);
    }, 20000);

    test('Negative Test: Missing Fields', async () => {
            // Test case where title is missing
            const res = await request(app)
                .post('/api/v1/blogs/')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('content', mockBlog.content);
      
            expect(res.status).toBe(400);
            // expect(res.body).toHaveProperty('message', 'Title is required');
      
            // Test case where content is missing
            const res2 = await request(app)
                .post('/api/v1/blogs/')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('title', mockBlog.title);
      
            expect(res2.status).toBe(400);
            // expect(res2.body).toHaveProperty('message', 'Content is required');
      
            // Test case where both title and content are missing
            const res3 = await request(app)
                .post('/api/v1/blogs/')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('title', '')
                .field('content', '');
      
            expect(res3.status).toBe(400);
            // expect(res3.body).toHaveProperty('message', 'Title and Content are required');
        }, 20000);
      
        test('Negative Test: Unauthorized Access', async () => {
            const res = await request(app)
                .post('/api/v1/blogs/')
                .field('title', mockBlog.title)
                .field('content', mockBlog.content);
      
            expect(res.status).toBe(401);
            // expect(res.body).toHaveProperty('message', 'Authorization token is required');
      
            // Invalid token scenario
            const res2 = await request(app)
                .post('/api/v1/blogs/')
                .set('Authorization', 'Bearer invalidToken')
                .field('title', mockBlog.title)
                .field('content', mockBlog.content);
      
            expect(res2.status).toBe(401);
            // expect(res2.body).toHaveProperty('message', 'Invalid or expired token');
        }, 20000);
});

// describe('Blog Endpoints', () => {
//   test('Negative Test: Missing Fields', async () => {
//       // Test case where title is missing
//       const res = await request(app)
//           .post('/api/v1/blogs/')
//           .set('Authorization', `Bearer ${accessToken}`)
//           .field('content', mockBlog.content);

//       expect(res.status).toBe(400);
//       // expect(res.body).toHaveProperty('message', 'Title is required');

//       // Test case where content is missing
//       const res2 = await request(app)
//           .post('/api/v1/blogs/')
//           .set('Authorization', `Bearer ${accessToken}`)
//           .field('title', mockBlog.title);

//       expect(res2.status).toBe(400);
//       // expect(res2.body).toHaveProperty('message', 'Content is required');

//       // Test case where both title and content are missing
//       const res3 = await request(app)
//           .post('/api/v1/blogs/')
//           .set('Authorization', `Bearer ${accessToken}`)
//           .field('title', '')
//           .field('content', '');

//       expect(res3.status).toBe(400);
//       // expect(res3.body).toHaveProperty('message', 'Title and Content are required');
//   }, 20000);

//   test('Negative Test: Unauthorized Access', async () => {
//       const res = await request(app)
//           .post('/api/v1/blogs/')
//           .field('title', mockBlog.title)
//           .field('content', mockBlog.content);

//       expect(res.status).toBe(401);
//       // expect(res.body).toHaveProperty('message', 'Authorization token is required');

//       // Invalid token scenario
//       const res2 = await request(app)
//           .post('/api/v1/blogs/')
//           .set('Authorization', 'Bearer invalidToken')
//           .field('title', mockBlog.title)
//           .field('content', mockBlog.content);

//       expect(res2.status).toBe(401);
//       // expect(res2.body).toHaveProperty('message', 'Invalid or expired token');
//   }, 20000);
// });

