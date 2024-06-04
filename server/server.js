// Application server
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 8000;

// Enable cookies
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// MongoDB connection URI
const mongoDB = 'mongodb://127.0.0.1:27017/fake_so';

// Connect to MongoDB
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Use express json middleware to automatically parse JSON
app.use(express.json());

// Enable CORS
const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:3000', // This should match the URL of your client-side application
  credentials: true, // This allows the server to accept cookies from the client
};
app.use(cors(corsOptions));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const session = require('express-session');

app.use(session({
  secret: 'secret_key',  // Secret key to sign the session ID cookie
  resave: false,              // Do not force session to be saved back to the session store
  saveUninitialized: true,    // Save a session that is new, but has not been modified
  cookie: { secure: true }    // Use secure cookies (only over HTTPS)
}));

// Import your models here
const Question = require('./models/questions');
const Answer = require('./models/answers');
const Tag = require('./models/tags');
const User = require('./models/users');
const Comment = require('./models/comments');
const comments = require('./models/comments');

// Routes go here
app.get('/search', async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).send('Search query is required.');
  }

  try {
    const queries = query.match(/(\[[^\]]+\]|[^\s]+)/g) || [];
    let filteredQuestions = [];

    // Assuming getAllQstns() is a function that retrieves all questions
    const allQuestions = await Question.find().populate('tags');

    // Check if each question matches any of the search terms
    allQuestions.forEach(question => {
      let matchesTag = queries.some(part => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const tagQuery = part.slice(1, -1).toLowerCase();
          return question.tags.some(tag => tag.name.toLowerCase().includes(tagQuery));
        }
        return false;
      });

      let matchesText = queries.some(part => {
        if (!part.startsWith('[') || !part.endsWith(']')) { // it's a text search
          const textQuery = part.toLowerCase();
          return question.title.toLowerCase().includes(textQuery) || question.text.toLowerCase().includes(textQuery);
        }
        return false;
      });

      if (matchesTag || matchesText) {
        filteredQuestions.push(question);
      }
    });

    res.json(filteredQuestions);
  } catch (error) {
    console.error('Error searching questions and tags:', error);
    res.status(500).send('Error during search.');
  }
});

app.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find().populate('tags').populate('answers');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST endpoint to create a new question
app.post('/questions', async (req, res) => {
  const { title, summary, text, tags, asked_by } = req.body;
  try {
    // Handle tags
    const tagIds = await Promise.all(tags.map(async (tagName) => {
      // Normalize tag name to lowercase
      const normalizedTagName = tagName.toLowerCase();
      // Check if tag already exists in lowercase
      let tag = await Tag.findOne({ name: normalizedTagName });
      if (!tag) {
        // If tag doesn't exist in lowercase, check uppercase
        tag = await Tag.findOne({ name: { $regex: new RegExp('^' + normalizedTagName + '$', 'i') } });
      }
      if (!tag) {
        // If tag doesn't exist in uppercase either, create a new one
        tag = new Tag({ name: normalizedTagName });
        await tag.save();
      }
      return tag._id;
    }));

    // Create the question
    const newQuestion = new Question({
      title,
      summary,
      text,
      tags: tagIds, // Array of ObjectId references
      asked_by,
      ask_date_time: new Date(),
      views: 0
    });

    const savedQuestion = await newQuestion.save();
    const user = await User.findOne({ username: asked_by });
    if (!user) {
      return res.status(404).send('User not found');
    }
    user.questions.push(savedQuestion._id);
    await user.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// PUT endpoint to increment the view count of a question
app.put('/questions/:id/increment-view', async (req, res) => {
  try {
    const questionId = req.params.id;
    const question = await Question.findByIdAndUpdate(
      questionId,
      { $inc: { views: 1 } }, // Increment views by 1
      { new: true } // Return the updated document
    ).populate('tags').populate('answers');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET endpoint to retrieve the total number of questions
app.get('/questions/count', async (req, res) => {
  try {
    const count = await Question.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET endpoint to search questions by id
app.get('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('tags').populate('answers');
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST endpoint to add an answer to a question
app.post('/questions/:id/answers', async (req, res) => {
  const { text, ans_by } = req.body;
  const questionId = req.params.id;

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const newAnswer = new Answer({
      text,
      ans_by,
      ans_date_time: new Date()
    });

    const savedAnswer = await newAnswer.save();

    question.answers.push(savedAnswer._id);
    await question.save();

    const user = await User.findOne({ username: ans_by });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.postedAnswers.push(savedAnswer._id);
    await user.save();

    res.status(201).json(savedAnswer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET endpoint to get all tags
app.get('/tags', async (req, res) => {
  try {
    const tags = await Tag.find({});
    const tagsWithCount = await Promise.all(tags.map(async (tag) => {
      const questionCount = await Question.countDocuments({ tags: tag._id });
      return { ...tag._doc, questionCount };
    }));
    res.json(tagsWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST endpoint to create a new tag
app.post('/tags', async (req, res) => {
  const { name } = req.body;
  // Check if the user's reputation is at least 50
  try {
    let tag = await Tag.findOne({ name: name.toLowerCase() }); // Search for a tag with the same name (case insensitive)
    if (!tag) {
      tag = new Tag({ name: name.toLowerCase() }); // Create a new tag if it doesn't exist
      await tag.save();
    }
    res.status(201).json(tag);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Tag already exists." });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Signup Endpoint
app.post('/users/register', async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send('User already exists.');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hash,
      memberSince: new Date(),
    });

    await newUser.save();
    res.status(201).send('User created successfully');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  }
});

// Login Endpoint
app.post('/users/login', async (req, res) => {
  const { identifier, password } = req.body; // Use 'identifier' to accept either email or username
  let user;

  try {
    // Check if the identifier is an email
    if (identifier.includes('@')) {
      user = await User.findOne({ email: identifier });
    } else {
      // If not an email, treat it as a username
      user = await User.findOne({ username: identifier });
    }

    if (!user) {
      return res.status(404).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    const token = jwt.sign({
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      reputation: user.reputation,
      isAdmin: user.isAdmin,
      memberSince: user.memberSince,
      questions: user.questions,
      createdTags: user.createdTags,
      postedAnswers: user.postedAnswers
    }, 'secret_key', { expiresIn: '1h' });

    res.cookie('token', token, { httpOnly: true, secure: true }); // Send a secure cookie with the token
    res.status(200).json({
      message: 'Login successful', token, user: {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        reputation: user.reputation,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login. Please try again.' });
  }
});


app.post('/users/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).send('Failed to logout');
      }
      res.clearCookie('token', { httpOnly: true, secure: true });  // Adjust according to your cookie settings
      res.send("Logged out successfully");
    });
  } else {
    res.status(400).send("Session not found");
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get('/', (req, res) => {
  console.log('Cookies: ', req.cookies);  // This logs all cookies sent by the client
  res.send('Check your server console!');
});

// Middleware to authenticate and attach user to the request
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, 'secret_key');
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } else {
    return res.status(403).json({ message: "No token provided" });
  }
};

// Profile endpoint to return user data
app.get('/users/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate('questions');
    ;
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('Failed to fetch user profile');
  }
});


const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(403).send('A token is required for authentication');
  }
  try {
    const decoded = jwt.verify(token, 'secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }
  return next();
};

app.post('/questions/:id/comments', async (req, res) => {
  const questionId = req.params.id;
  const { text, ans_by } = req.body;

  if (text.length > 140) {
    return res.status(400).send('Comment exceeds 140 characters limit.');
  }

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).send('Question not found.');
    }

    const newComment = new Comment({
      text,
      ans_by,
    });

    await newComment.save();
    question.comments.push(newComment._id);
    await question.save();

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET endpoint to fetch all comments for a specific question
app.get('/questions/:id/comments', async (req, res) => {
  const questionId = req.params.id;

  try {
    const question = await Question.findById(questionId).populate('comments');
    if (!question) {
      return res.status(404).send('Question not found.');
    }

    res.status(200).json(question.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT endpoint to upvote a comment
app.put('/comments/:id/upvote', async (req, res) => {
  const { id } = req.params;
  const userData = req.body.username;

  try {
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).send('Comment not found');
    }
    if (comment.ans_by === userData) {
      return res.status(400).send('You cannot upvote your own comment');
    }

    comment.votes += 1;
    comment.voters.push(userData);
    await comment.save();

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new comment to an answer
app.post('/answers/:answerId/comments', async (req, res) => {
  const { answerId } = req.params;
  const { text, ans_by } = req.body;

  if (text.length > 140) {
    return res.status(400).send('Comment exceeds 140 characters limit.');
  }

  try {
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).send('Answer not found');
    }

    const newComment = new Comment({
      text,
      ans_by,
      ans_date_time: new Date()
    });

    await newComment.save();
    answer.comments.push(newComment);
    await answer.save();

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all comments for an answer
app.get('/answers/:answerId/comments', async (req, res) => {
  const { answerId } = req.params;

  try {
    const answer = await Answer.findById(answerId).populate('comments');
    if (!answer) {
      return res.status(404).send('Answer not found');
    }

    res.status(200).json(answer.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT endpoint to upvote a question
app.put('/questions/:id/upvote', async (req, res) => {
  const questionId = req.params.id;
  const userData = req.body.userData;
  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).send('Question not found');
    }
    if (question.asked_by === userData.username) {
      return res.status(400).send('You cannot upvote your own question');
    }
    
    // Increment vote count
    question.votes += 1;
    if (question.downvoters.includes(userData.username)) {
      question.downvoters = question.downvoters.filter((username) => username !== userData.username);
    }
    else {
      question.upvoters.push(userData.username);
    }
    await question.save();

    const user = await User.findOne({ username: question.asked_by });
    user.reputation += 5;
    await user.save();

    res.status(200).json(question);
  } catch (error) {
    res.status(500).send('Error upvoting the question: ' + error);
  }
});

// PUT endpoint to downvote a question
app.put('/questions/:id/downvote', async (req, res) => {
  const questionId = req.params.id;
  const userData = req.body.userData;
  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).send('Question not found');
    }
    if (question.asked_by === userData.username) {
      return res.status(400).send('You cannot upvote your own question');
    }
    // Decrement vote count
    if (question.votes > 0)
    {
      question.votes -= 1;
      if (question.upvoters.includes(userData.username)) {
        question.upvoters = question.upvoters.filter((username) => username !== userData.username);
      }
      else {
        question.downvoters.push(userData.username);
      }
    }

    await question.save();

    const user = await User.findOne({ username: question.asked_by });
    user.reputation -= 10;
    await user.save();

    res.status(200).json(question);
  } catch (error) {
    res.status(500).send('Error downvoting the question: ' + error);
  }
});

// PUT endpoint to upvote an answer
app.put('/answers/:id/upvote', async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    const userData = req.body.userData;
    if (!answer) return res.status(404).send('Answer not found');
    if (answer.ans_by === userData.username) {
      return res.status(400).send('You cannot upvote your own answer');
    }

    answer.votes += 1;
    if (answer.downvoters.includes(userData.username)) {
      answer.downvoters = answer.downvoters.filter((username) => username !== userData.username);
    }
    else {
      answer.upvoters.push(userData.username);
    }
    await answer.save();

    const user = await User.findOne({ username: answer.ans_by });
    user.reputation += 5;
    await user.save();

    res.status(200).json(answer);
  } catch (error) {
    res.status(500).send('Error upvoting the answer: ' + error.message);
  }
});

// PUT endpoint to downvote an answer
app.put('/answers/:id/downvote', async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    const userData = req.body.userData;
    if (!answer) return res.status(404).send('Answer not found');
    if (answer.ans_by === userData.username) {
      return res.status(400).send('You cannot upvote your own answer');
    }
    if (answer.votes > 0)
    {
      answer.votes -= 1;
      if (answer.upvoters.includes(userData.username)) {
        answer.upvoters = answer.upvoters.filter((username) => username !== userData.username);
      }
      else {
        answer.downvoters.push(userData.username);
      }
    }
    
    await answer.save();

    const user = await User.findOne({ username: answer.ans_by });
    user.reputation -= 10;
    await user.save();

    res.status(200).json(answer);
  } catch (error) {
    res.status(500).send('Error downvoting the answer: ' + error.message);
  }
});

// DELETE endpoint to remove a user and all their information
app.delete('/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    await Question.deleteMany({ asked_by: user.username });
    await Answer.deleteMany({ ans_by: user.username });
    await Comment.deleteMany({ ans_by: user.username });

    await user.deleteOne();
    res.status(200).send('User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Failed to delete user');
  }
});

// PUT endpoint to update a question
app.put('/questions/:id', async (req, res) => {
  const { title, summary, text, tags } = req.body;

  try {
    // Find or create tags and convert to tag IDs
    const tagIds = await Promise.all(tags.map(async (tagName) => {
      let tag = await Tag.findOne({ name: tagName });
      if (!tag) {
        tag = new Tag({ name: tagName });
        await tag.save();
      }
      return tag._id;
    }));

    const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, {
      title,
      summary,
      text,
      tags: tagIds
    }, { new: true }).populate('tags');

    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).send('Question not found');
    }

    await question.deleteOne();
    res.status(200).send('Question deleted successfully');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to get all answers by a specific user
app.get('/users/:userId/answers', async (req, res) => {
  try {
    const userId = req.params.userId;
    const answers = await Answer.find({ ans_by: userId }).populate('question');
    res.status(200).json(answers);
  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).send('Error fetching answers');
  }
});



app.get('/protected', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'This is a protected route',
    user: req.user // Send back user data
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});