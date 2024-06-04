const mongoose = require('mongoose');
const User = require('./models/users'); 
const Comment = require('./models/comments');
const mongoDB = 'mongodb://127.0.0.1:27017/test_db'; 

describe('MongoDB and Mongoose Tests', () => {
    beforeAll(async () => {
        await mongoose.connect(mongoDB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear collections or specific data here to ensure test isolation
        await User.deleteMany({});
        await Comment.deleteMany({});
    });

    // Unit Test #1: Check if the user model is defined
    test('create & save user successfully', async () => {
        const userData = { firstName: 'John', lastName: 'Doe', email: 'john@example.com', username: 'john123', password: '12345' };
        const validUser = new User(userData);
        const savedUser = await validUser.save();
        expect(savedUser._id).toBeDefined();
        expect(savedUser.email).toBe(userData.email);
    });

    // Unit Test #2: Check if the user model throws an error when required fields are missing
    test('create user without required field should fail', async () => {
        const userData = { firstName: 'John' };
        let err;
        try {
            const invalidUser = new User(userData);
            await invalidUser.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.email).toBeDefined();
    });

    // Unit Test #3: Check if the comment model is defined
    test('Add new comment', async () => {
        const commentData = {
          text: "This is a test comment.",
          ans_by: "John",
          votes: 5,
        };
        const comment = new Comment(commentData);
        await comment.save();
        
        const foundComment = await Comment.findById(comment._id);
        expect(foundComment.votes).toEqual(commentData.votes);
        expect(foundComment.text).toEqual(commentData.text);
        expect(foundComment.ans_by).toEqual(commentData.ans_by);
    });
});


describe('Server Tests', () => {
    const axios = require('axios');
    let server;
    beforeAll(() => {
        server = require('./server');
    });

    afterAll(async () => {
        // Properly close your server and any database connections here
        if (server && server.close) {
            server.close();
        }
        await mongoose.connection.close();
    });
    
    

    // Integration Test #1: Check creation of question in server is succesful
    test('POST /questions - Create a new question', async () => {
        const newQuestion = {
            title: "New Question Title",
            summary: "Summary of new question",
            text: "Detailed description of the new question",
            tags: [],  // Assuming this should be an array of tag IDs
            asked_by: "TestUser"
        };
        const response = await axios.post('http://localhost:8000/questions', newQuestion);
        expect(response.status).toEqual(201);  // Expecting HTTP 201 Created
        expect(response.data.title).toEqual(newQuestion.title);
        expect(response.data.asked_by).toEqual(newQuestion.asked_by);
    });

    // Integration Test #2: Check if the server returns error requisting user without authen
    test('GET /users/profile - Access without authentication should fail', async () => {
        // Attempt to access the protected route without any authentication tokens
        try {
            const response = await axios.get('http://localhost:8000/users/profile');
            // If it does not throw an error, explicitly fail the test
            expect(response.status).not.toBe(200); // Ensuring the test fails if status code 200 is returned
        } catch (error) {
            // Check if the proper status code is returned for unauthorized access
            expect(error.response.status).toBe(403); 
        }
    });

    // Integration Test #3: Check if the server returns the questions
    test('Get questions', async () => {
        const response = await axios.get('http://localhost:8000/questions');
        expect(response.status).toEqual(200)
    });
});

