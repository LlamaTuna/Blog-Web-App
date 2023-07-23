
//index.js - main application file
// Importing necessary Node.js modules
const path = require('path');
const express = require('express');
const app = express();
const port = 3000;
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const authorRoutes = require('./routes/author')(passport);
const flash = require('connect-flash');
const readerRoutes = require('./routes/reader');
const loginRoutes = require('./routes/loginRoutes');
const register = require('./routes/register')

// Set up application to use bodyParser middleware for parsing HTTP request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Use flash for storing messages in session
app.use(flash());

// Use expressLayouts for layout support in EJS templates
app.use(expressLayouts);

// Set view engine to EJS
app.set('view engine', 'ejs');

// Set up static file serving
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static('node_modules'));

// Use express-session for session management
app.use(session({
  secret: 'cm2040 midterm',
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Middleware to make flash messages available in templates
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages');
  res.locals.error_messages = req.flash('error_messages');
  next();
});

// Mounting routes
app.use('/', loginRoutes);
app.use('/', readerRoutes);
app.use('/reader', readerRoutes);
app.use('/author', authorRoutes);
app.use('/author', loginRoutes);
app.use('/', register);

// Initializing SQLite database
global.db = new sqlite3.Database('./database.db', function(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  } else {
    console.log("Database connected");
    global.db.run("PRAGMA foreign_keys=ON");
  }
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
  next();
});

// Passport.js local strategy for authentication
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, (username, password, done) => {
  // find user by username
  global.db.get("SELECT * FROM Authors WHERE author_name = ?", [username], function(err, user) {
    if (err) {
      return done(err);
    }

    // user not found
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    // hash the entered password
    bcrypt.hash(password, 10, function(err, hashedPassword) {
      if (err) {
        console.error(err);
        return done(err);
      }

      // log the hashed password
      console.log(`Hashed entered password: ${hashedPassword}`);

      // compare passwords
      console.log('User object:', user);
      bcrypt.compare(password, user.password_hash, function(err, res) {
        if (err) {
          return done(err);
        }

        // password does not match
        if (!res) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        // passwords match, return user
        return done(null, user);
      });
    });
  });
}));

// Passport.js serialization and deserialization methods for sessions
passport.serializeUser((user, done) => {
  done(null, user.author_id);
});

passport.deserializeUser((id, done) => {
  global.db.get("SELECT * FROM Authors WHERE author_id = ?", [id], function(err, author) {
    done(err, author);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Starting the Express server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
