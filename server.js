const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();  // Add this line to load environment variables
const app = express();

console.log('Starting server initialization...');

// Middleware
app.use(cors());
app.use(express.json());

// In-memory user storage (replace with a database in production)
const users = [];
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your-secret-key';

console.log('Middleware and configuration set up...');

// Authentication endpoints
app.post('/api/auth/signup', async (req, res) => {
  console.log('Received signup request:', req.body);
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    if (users.find(u => u.email === email)) {
      console.log('User already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = {
      id: users.length + 1,
      fullName,
      email,
      password: hashedPassword
    };

    users.push(user);
    console.log('New user created:', { id: user.id, email: user.email });

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  console.log('Received login request:', req.body);
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    console.log('Login successful for user:', email);

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

app.get('/api/auth/validate', (req, res) => {
  console.log('Received token validation request');
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      console.log('Invalid token - user not found');
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('Token validated for user:', user.email);
    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email
    });
  } catch (error) {
    console.error('Error in token validation:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

const PORT = process.env.NODE_PORT || 4000;  // Use NODE_PORT from environment
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /api/auth/signup');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/auth/validate');
}); 