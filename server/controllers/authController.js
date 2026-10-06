import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to sign JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'weshare_super_secret_jwt_key_2026_secure',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with that email already exists',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user',
    });
  }
};

// @desc    Get all household users (for selectors and balance calculation)
// @route   GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('_id name email avatarColor');
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

// @desc    Seed the 3 household friends if collection is empty
// @route   POST /api/auth/seed
export const seedHousehold = async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count >= 3) {
      const users = await User.find().select('_id name email avatarColor');
      return res.json({
        success: true,
        message: 'Household users already exist',
        users,
      });
    }

    // Default 3 household roommates
    const defaultFriends = [
      { name: 'NSN (me)', email: 'nyi@gmail.com', password: 'password123', avatarColor: '#3B82F6' },
      { name: 'WMO', email: 'wine@gmail.com', password: 'password123', avatarColor: '#c792ea' },
      { name: 'YYP', email: 'yair@gmail.com', password: 'password123', avatarColor: '#F59E0B' },
    ];

    const created = [];
    for (const friend of defaultFriends) {
      const exists = await User.findOne({ email: friend.email });
      if (!exists) {
        const u = await User.create(friend);
        created.push({ _id: u._id, name: u.name, email: u.email, avatarColor: u.avatarColor });
      }
    }

    const allUsers = await User.find().select('_id name email avatarColor');
    res.json({
      success: true,
      message: 'Household seeded successfully',
      users: allUsers,
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed household users',
    });
  }
};
