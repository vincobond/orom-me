require('dotenv').config();  // Add this at the top of the file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const PhotizoModel = require('./models/models');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Rate limiting setup for registration route
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 registration requests
  message: "Too many requests, please try again later."
});

// Register route
app.post('/register', [
  // Validation checks using express-validator
  body('name').notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('phone').notEmpty().withMessage('Phone number is required.'),
  body('nationality').notEmpty().withMessage('Nationality is required.'),
  body('state').notEmpty().withMessage('State is required.'),
  body('role').notEmpty().withMessage('Role is required.')
], registerLimiter, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, nationality, state, role } = req.body;

  try {
    // Check if the email already exists in the database
    const existing = await PhotizoModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // Create a new record
    const record = await PhotizoModel.create({
      name, email, phone, nationality, state, role,
    });

    // Prepare the email options to notify admin
    const mailOptionsToAdmin = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,  // Admin email to receive registration details
      subject: 'New Volunteer Registration - Photizo Foundation',
      html: `
        <h2>New Volunteer Registration</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Nationality:</strong> ${nationality}</p>
        <p><strong>State:</strong> ${state}</p>
        <p><strong>Role:</strong> ${role}</p>
      `
    };

    // Prepare the confirmation email options to send to user
    const mailOptionsToUser = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "You're Registered – Photizo Foundation",
      html: `
        <h3>Welcome, ${name}!</h3>
        <p>Thank you for registering as a volunteer. We'll contact you soon.You can call this number too 08065699704</p>
      `
    };

    // Send the emails asynchronously (in the background)
    const emailPromises = [
      transporter.sendMail(mailOptionsToAdmin),
      transporter.sendMail(mailOptionsToUser)
    ];

    // Respond immediately to the client before emails are sent
    res.status(201).json({
      message: "Registration successful! We have sent an email with the details.",
      record,
    });

    // Execute email sending in the background
    Promise.all(emailPromises).catch(err => {
      console.error("Error sending email:", err);
    });

  } catch (err) {
    console.error("Error processing registration:", err);
    res.status(500).json({ error: "Failed to process registration or send email.", details: err.message });
  }
});

// Start the server
app.listen(3001, () => {
  console.log("Server running on port 3001");
});
