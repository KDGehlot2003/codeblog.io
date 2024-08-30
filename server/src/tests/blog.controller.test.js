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
    content: 'This is the content of the sample blog.'
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
        const thumbnailPath = path.join(__dirname, 'assets', 'thumbnail.jpg');
        
        // Ensure the thumbnail file exists for the test
        if (!fs.existsSync(thumbnailPath)) {
            throw new Error('Thumbnail file not found');
        }

        const res = await request(app)
            .post('/api/v1/blogs/') // Replace with your actual endpoint
            .set('Authorization', `Bearer ${accessToken}`)
            .field('title', mockBlog.title)
            .field('content', mockBlog.content);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('message', 'Blog created successfully');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('title', mockBlog.title);
        expect(res.body.data).toHaveProperty('content', mockBlog.content);
        // expect(res.body.data).toHaveProperty('thumbnail');

        // Check that the blog is saved in the database
        const blog = await Blog.findOne({ title: mockBlog.title });
        expect(blog).not.toBeNull();
        expect(blog.title).toBe(mockBlog.title);
        expect(blog.content).toBe(mockBlog.content);
        // expect(blog.thumbnail).toBeTruthy(); // Ensure thumbnail path is valid
    }, 20000);
});
