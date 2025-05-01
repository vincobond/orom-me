require('dotenv').config();  // Add this at the top of the file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
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

// Register route
app.post('/register', async (req, res) => {
  const { name, email, phone, nationality, state, role } = req.body;
  
  // Check if all fields are present
  if (!name || !email || !phone || !nationality || !state || !role) {
    return res.status(400).json({ error: "All fields are required." });
  }

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

    // Prepare the email options to send
    const mailOptions = {
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

    // Send the email with registration details
    await transporter.sendMail(mailOptions);

    // Return successful response
    res.status(201).json({
      message: "Registration successful! We have sent an email with the details.",
      record,
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
