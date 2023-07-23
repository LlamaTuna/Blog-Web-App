// loginRoutes.js -- All login routes
const express = require('express');
const passport = require('passport');
const router = express.Router();
const bcrypt = require('bcryptjs');

/**
 * @desc Login route
 * @route POST /login
 * @input username, password (from request body)
 * @output Redirect to the author's home page after successful login, or redirect back to the login page with an error message if the login fails
 */
router.post('/login', (req, res, next) => {
  const { username, password } = req.body;

  // Retrieve the user from the database
  db.get("SELECT * FROM Authors WHERE author_name = ?", [username], function(err, user) {
    if (err) {
      return res.status(500).send('Error retrieving user');
    }

    if (!user) {
      req.flash('error_messages', 'Invalid username or password');
      return res.redirect('/login');
    }

    if (!user.password_hash) {
      // The user's password is not set
      req.flash('error_messages', 'You must set your password before you can log in');
      return res.redirect('/login');
    }

    // Compare the provided password with the stored hash
    bcrypt.compare(password, user.password_hash, (err, result) => {
      if (err) {
        return res.status(500).send('Error comparing password and hash');
      }

      if (result) {
        // The passwords match
        req.logIn(user, (err) => {
          if (err) {
            return res.status(500).send('Error logging in');
          }

          // Store the author_id in the session
          req.session.authorId = user.author_id;

          // Redirect to the author page
          res.redirect('/author');
        });
      } else {
        // The passwords don't match
        req.flash('error_messages', 'Invalid username or password');
        res.redirect('/login');
      }
    });
  });
});


/**
 * @desc Reset password route
 * @route POST /reset
 * @input username, newPassword (from request body)
 * @output Redirect to the login page with a success message after successful password reset
 */
router.post('/reset', (req, res) => {
  const { username, newPassword } = req.body;

  // Hash the new password
  bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
    if (err) {
      req.flash('error_messages', 'Error hashing password');
      return res.redirect('/reset');
    }

    // Update the user's password in the database
    db.run("UPDATE Authors SET password_hash = ? WHERE author_name = ?", [hashedPassword, username], function(err) {
      if (err) {
        req.flash('error_messages', 'Error updating password');
        return res.redirect('/reset');
      }

      // Set a success flash message
      req.flash('success_messages', 'Password updated successfully');

      // Render the reset page with the success message
      res.render('reset', {
        title: 'Reset Password',
        error_messages: req.flash('error_messages'),
        success_messages: req.flash('success_messages'),
        heroText: {
          title: 'Author Reset Password Portal',
          subtitle: '',  // Add subtitle if needed
          author: ''     // Add author if needed
        }
      });
    });
  });
});


/**
 * @desc Get reset password page
 * @route GET /reset
 * @input None
 * @output Render the reset password page
 */
router.get('/reset', (req, res) => {
  res.render('reset', { 
    title: 'Reset Password', 
    message: '',
    heroText: {
      title: 'Author Reset Password Portal',
      subtitle: '',  // Add subtitle if needed
      author: ''     // Add author if needed
    }
  }); // Pass an empty string as message
});

/**
 * @desc Get login page
 * @route GET /login
 * @input None
 * @output Render the login page with a message (if any)
 */
router.get('/login', (req, res) => {
  const message = req.query.message;
  res.render('login', { 
    title: 'Login', 
    message: message,
    heroText: {
      title: 'Author Login Portal',
      subtitle: '',  // Add subtitle if needed
      author: ''     // Add author if needed
    }
  });
});

module.exports = router;
