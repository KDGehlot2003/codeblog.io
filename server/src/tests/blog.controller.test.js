const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const {app} = require('../app');
const connectDB = require('../db/index')
const fs = require('fs').promises;
const path = require('path');
const { deserialize } = require('v8');


let mongoServer;
let server;

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
  



describe("createBlog", () => {
    it("should create a new blog", async () => {
        const loginrespose = await request(app)
        .post("/api/v1/users/login")
        .send({
            "email": "kd@gmail.com",
            "username": "kd",
            "password": "kd123"
        })
        .expect(200);

        const response = await request(app)
        .post("/api/v1/blogs/")
        .send({
            title: "My first blog",
            content: "This is my first blog",

        })
        .expect(201);
    })
})