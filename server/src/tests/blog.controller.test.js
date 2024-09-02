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
    title: 'Blog 1',
    content: 'Content 1',
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
    console.log("\n\n\n\n\n\n\n",loginRes.body);
    accessToken = loginRes.body.data.accessToken;
    refreshToken = loginRes.body.data.refreshToken;
});

afterAll(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
    if (server) {
        server.close(() => {
            console.log('Server closed');
        });
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
});


describe('Create Blog Post Endpoints', () => {
    test('Positive Test: Create Blog Successfully', async () => {
        
        const res = await request(app)
            .post('/api/v1/blogs/')
            .set('Authorization', `Bearer ${accessToken}`)
            .field('title', mockBlog.title)
            .field('content', mockBlog.content)
            .field('category',mockBlog.category);
        // console.log("\n\n\n",res);
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


describe('Get Blog Endpoints', () => {
    test('Positive Test: Get Blog Successfully', async () => {
        const res = await request(app)
            .get('/api/v1/blogs/')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Blogs fetched successfully');
        expect(res.body).toHaveProperty('data');
        console.log(res.body);
        expect(res.body.data.blogs).toHaveLength(1);
    }, 20000);

    test('Negative Test: Unauthorized Access', async () => {
        const res = await request(app)
            .get('/api/v1/blogs/');

        expect(res.status).toBe(401);
        // expect(res.body).toHaveProperty('message', 'Authorization token is required');

        // Invalid token scenario
        const res2 = await request(app)
            .get('/api/v1/blogs/')
            .set('Authorization', 'Bearer invalidToken');

        expect(res2.status).toBe(401);
        // expect(res2.body).toHaveProperty('message', 'Invalid or expired token');
    }, 20000);

    describe('Tests for sorting and filtering', () => {
        const mockBlogs = [
            {
                title: 'Blog 2',
                content: 'Content 2',
                category: 'DSA'
            },
            {
                title: 'Blog 3',
                content: 'Content 3',
                category: 'Web Development'
            },
            {
                title: 'Blog 4',
                content: 'Content 4',
                category: 'DSA'
            },
            {
                title: 'Blog 5',
                content: 'Content 5',
                category: 'Web Development'
            },
        ];

        beforeAll(async () => {
            for(let i of mockBlogs){
                console.log(i)
                await request(app)
                .post('/api/v1/blogs/')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('title', i.title)
                .field('content', i.content)
                .field('category',i.category);
            }
        });

        test('Positive Test: Sort by Title', async () => {
            const res = await request(app)
                .get('/api/v1/blogs/?sortBy=title')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Blogs fetched successfully');
            expect(res.body).toHaveProperty('data');
            expect(res.body.data.blogs).toHaveLength(5);
            expect(res.body.data.blogs[0].title).toBe('Blog 1');
            expect(res.body.data.blogs[1].title).toBe('Blog 2');
            expect(res.body.data.blogs[2].title).toBe('Blog 3');
            expect(res.body.data.blogs[3].title).toBe('Blog 4');
            expect(res.body.data.blogs[4].title).toBe('Blog 5');
        }, 20000);

        test('Positive Test: Sort by Category', async () => {
            const res = await request(app)
                .get('/api/v1/blogs/?sortBy=category')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Blogs fetched successfully');
            expect(res.body).toHaveProperty('data');
            expect(res.body.data.blogs).toHaveLength(5);
            expect(res.body.data.blogs[0].category).toBe('DSA');
            expect(res.body.data.blogs[1].category).toBe('DSA');
            expect(res.body.data.blogs[2].category).toBe('DSA');
            expect(res.body.data.blogs[3].category).toBe('Web Development');
            expect(res.body.data.blogs[4].category).toBe('Web Development');
        });

        test('Positive Test: Filter by startDate', async () => {
            const res = await request(app)
                .get('/api/v1/blogs/?startDate=2021-10-01')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Blogs fetched successfully');
            expect(res.body).toHaveProperty('data');
            expect(res.body.data.blogs).toHaveLength(5);
        });
        test('Positive Test: Filter by endDate', async()=>{
            const res = await request(app)
            .get('/api/v1/blogs/?endDate=2025-10-01')
            .set('Authorization', `Bearer ${accessToken}`);
            // console.log("\n\n\n\n\n\n\n",res.body);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Blogs fetched successfully');
            expect(res.body).toHaveProperty('data');
            expect(res.body.data.blogs).toHaveLength(5);

        });
        test('Positive Test: Filter by both startDate and endDate', async()=>{
            const res = await request(app)
            .get('/api/v1/blogs/?endDate=2025-10-01&startDate=2021-10-01')
            .set('Authorization', `Bearer ${accessToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Blogs fetched successfully');
            expect(res.body).toHaveProperty('data');
            expect(res.body.data.blogs).toHaveLength(5);
        })
        test('Positve Test: Filter by Category',async()=>{
            const res= await request(app)
            .get('/api/v1/blogs/?category=DSA')
            .set('Authorization', `Bearer ${accessToken}`);
            expect(res.status).toBe(200);
            console.log("\n\n\n\n\n",res.body);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data.blogs).toHaveLength(3);
        })

        test('Positive Test: Pagination', async()=>{
            const res= await request(app)
            .get('/api/v1/blogs/?limit=3&page=1')
            .set('Authorization', `Bearer ${accessToken}`);
            expect(res.status).toBe(200);
            console.log("\n\n\n\n\n",res.body);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data.blogs).toHaveLength(3);
            expect(res.body.data).toHaveProperty('currentPage',1);
            expect(res.body.data).toHaveProperty('totalPages',2);
        })
    });
},20000);

