// register.js -- All register routes
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const saltRounds = 10;

/**
 * @desc Render registration page
 * @route GET /author/register
 * @input None
 * @output Render the registration page
 */
router.get('/author/register', (req, res) => {
  res.render('register', { 
    title: 'Registration', 
    message: '',  // Add a message if needed
    heroText: {
      title: 'Author Registration Portal',
      subtitle: '',  // Add subtitle if needed
      author: ''     // Add author if needed
    },
    error_messages: req.flash('error'),  // Retrieve 'error' flash messages
    success_messages: req.flash('success')  // Retrieve 'success' flash messages
  });
});

/**
 * @desc Register a new user
 * @route POST /register
 * @input username, password (from request body)
 * @output Redirect to the login page after successful registration
 */
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Check if user already exists
  db.get("SELECT * FROM Authors WHERE author_name = ?", [username], function(err, user) {
    if (err) {
      return res.status(500).send('Error checking user');
    }

    // If user exists, flash a message and render the registration page again
    if (user) {
      req.flash('error', 'That didn\'t work. Do you already have an account?');
      return res.render('register', { 
        title: 'Registration', 
        error_messages: req.flash('error'),  // Only flash 'error' message
        success_messages: []  // No 'success' messages to flash
      });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).send('Error hashing password');
      }

      // Store the username and hashed password in the database
      db.run("INSERT INTO Authors (author_name, password_hash) VALUES (?, ?)", [username, hashedPassword], function(err) {
        if (err) {
          return res.status(500).send('Error saving user');
        }

        // Flash a success message
        req.flash('success', 'Registration successful!');

        // Render the register page with success message
        res.render('register', { 
          title: 'Registration', 
          error_messages: [],  // No 'error' messages to flash
          success_messages: req.flash('success')  // Only flash 'success' message
        });
      });
    });
  });
});

module.exports = router;
