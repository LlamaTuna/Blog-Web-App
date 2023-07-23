// author.js -- all author routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authorId = 1; // Replace this with actual author_id

module.exports = function(passport) {
  // Define ensureAuthenticated middleware
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      // If the user is authenticated, allow access to the next middleware or route handler
      return next();
    }
    // If not authenticated, redirect to the login page
    res.redirect('/login');
  }

/**
 * @desc Get author's home page
 * @route GET /author
 * @input None
 * @output Render the author's home page with the author's information and articles
 */
  router.get('/', ensureAuthenticated, (req, res, next) => {
    global.db.get("SELECT * FROM Authors WHERE author_id = ?", [req.session.authorId], function(err, author) {
      if (err) {
        next(err);
      } else {
        global.db.all(`
          SELECT 
            Articles.*, 
            Authors.author_name,
            (SELECT COUNT(user_id) FROM UserLikes WHERE UserLikes.article_id = Articles.article_id) as likes_count
          FROM 
            Articles 
          JOIN 
            Authors ON Articles.author_id = Authors.author_id
          WHERE 
            Articles.author_id = ?`, [req.session.authorId], 
          function(err, articles) {
            if (err) {
              next(err);
            } else {
              res.render('author', { 
                title: 'Author Home Page', 
                heroText: {
                  title: 'Author Home Page',
                  subtitle: '',  // Add subtitle if needed
                  author: ''     // Add author if needed
                },
                blogTitle: author.blog_title,
                subtitle: author.blog_subtitle,
                authorName: author.author_name,
                articles: articles
              });
            }
          }
        );
      }
    });
  });
  
/**
 * @desc Get edit article page
 * @route GET /author/edit/:articleId
 * @input articleId (from URL parameters)
 * @output Render the edit article page with the article's information
 */
  router.get('/edit/:articleId', ensureAuthenticated, (req, res, next) => {
    global.db.get(`
      SELECT 
        Articles.*, 
        Authors.author_name
      FROM 
        Articles 
      JOIN 
        Authors ON Articles.author_id = Authors.author_id
      WHERE 
        article_id = ?`, [req.params.articleId], 
      function(err, article) {
        if (err) {
          next(err);
        } else {
          res.render('edit', { 
            title: 'Edit Article', 
            heroText: {
              title: article.title,
              subtitle: article.subtitle,
              author: `By: ${article.author_name}`
            },
            blogTitle: article.title, 
            subtitle: article.subtitle,
            createdDate: article.created_date,
            modifiedDate: article.modified_date,
            status: article.status,
            bodyText: article.text,
            articleId: req.params.articleId 
          });
        }
      }
    );
  });
  
/**
 * @desc Edit an article
 * @route POST /author/edit/:articleId
 * @input articleId (from URL parameters), title, subtitle, body (from request body)
 * @output Redirect to the author's home page after updating the article
 */
  router.post('/edit/:articleId', ensureAuthenticated, (req, res, next) => {
    const { title, subtitle, body } = req.body;
    const articleId = req.params.articleId;

    global.db.run(
      "UPDATE Articles SET title = ?, subtitle = ?, text = ?, modified_date = CURRENT_TIMESTAMP WHERE article_id = ?",
      [title, subtitle, body, articleId],
      function(err) {
        if (err) {
          next(err);
        } else {
          res.redirect(`/author`);
        }
      }
    );
  });

/**
 * @desc Publish an article
 * @route GET /author/publish/:articleId
 * @input articleId (from URL parameters)
 * @output Redirect to the author's home page after publishing the article
 */
  router.get('/publish/:articleId', ensureAuthenticated, (req, res, next) => {
    const articleId = req.params.articleId;

    global.db.run(
      "UPDATE Articles SET status = 'published' WHERE article_id = ?",
      [articleId],
      function(err) {
        if (err) {
          next(err);
        } else {
          res.redirect(`/author`);
        }
      }
    );
  });

/**
 * @desc Create a new draft
 * @route POST /author/newdraft
 * @input title, subtitle, body (from request body)
 * @output Redirect to the author's home page after creating the new draft
 */
  router.post('/newdraft', ensureAuthenticated, (req, res, next) => {
    const blogTitle = req.body.title; 
    const subtitle = req.body.subtitle;
    const bodyText = req.body.body;

    global.db.run(
      "INSERT INTO Articles (author_id, title, subtitle, text, status, created_date, modified_date) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", 
      [req.session.authorId, blogTitle, subtitle, bodyText, 'draft'], 
      function(err) {
        if (err) {
          next(err);
        } else {
          res.redirect(`/author`);
        }
    });
  });

/**
 * @desc Delete an article
 * @route DELETE /author/article/:articleId
 * @input articleId (from URL parameters)
 * @output Send a JSON response with a success message after deleting the article and its associated comments and likes
 */
    router.delete('/article/:articleId', ensureAuthenticated, (req, res, next) => {
      const articleId = req.params.articleId;
  
      global.db.run("PRAGMA foreign_keys = ON", [], function(err) {
        if (err) {
          next(err);
        } else {
          // Delete the likes associated with the article
          global.db.run(
            "DELETE FROM UserLikes WHERE article_id = ?",
            [articleId],
            function(err) {
              if (err) {
                next(err);
              } else {
                // Delete the comments associated with the article
                global.db.run(
                  "DELETE FROM Comments WHERE article_id = ?",
                  [articleId],
                  function(err) {
                    if (err) {
                      next(err);
                    } else {
                      // Delete the article
                      global.db.run(
                        "DELETE FROM Articles WHERE article_id = ?",
                        [articleId],
                        function(err) {
                          if (err) {
                            next(err);
                          } else {
                            res.json({ message: "Article and associated comments and likes deleted successfully!" });
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      });
    });
  
/**
 * @desc Post an article
 * @route POST /author/article
 * @input title, text (from request body)
 * @output Send a JSON response with a success message after posting the article
 */
    router.post('/article', ensureAuthenticated, (req, res, next) => {
      const { title, text } = req.body;
  
      global.db.run(
        "INSERT INTO Articles (author_id, title, text) VALUES (?, ?, ?)",
        [req.session.authorId, title, text],
        function(err) {
          if (err) {
            next(err);
          } else {
            res.json({ message: "Article posted successfully!" });
          }
        }
      );
    });
  
/**
 * @desc Get new draft page
 * @route GET /author/newdraft
 * @input None
 * @output Render the new draft page
 */
    router.get('/newdraft', ensureAuthenticated, (req, res, next) => {
      res.render('new-draft', {
        title: 'Create New Draft',
        heroText: {
          title: 'Create New Draft',
          subtitle: '',  // Add subtitle if needed
          author: ''     // Add author if needed
        },
      });
    });
  
 /**
 * @desc Get author settings
 * @route GET /author/settings
 * @input None
 * @output Render the author settings page with the author's information
 */
    router.get('/settings', ensureAuthenticated, (req, res, next) => {
      global.db.get("SELECT * FROM Authors WHERE author_id = ?", [req.session.authorId], function(err, author) {
        if (err) {
          console.error('Database error:', err);
          next(err);
        } else {
          console.log('Retrieved author:', author);
          res.render('settings', { 
            title: 'Edit Author Settings',
            heroText: {
              title: 'Edit Author Settings',
              subtitle: '',  // Add subtitle if needed
              author: ''
            },
            authorName: author.author_name,  // Pass authorName to the view
            blogTitle: author.blog_title,    // Pass blogTitle to the view
            subtitle: author.blog_subtitle   // Pass subtitle to the view
          });
        }
      });
    });
  
/**
 * @desc Update author settings
 * @route POST /author/settings
 * @input blogTitle, subtitle, authorName (from request body)
 * @output Redirect to the author's home page after updating the author's settings
 */
    router.post('/settings', ensureAuthenticated, (req, res, next) => {
      const { blogTitle, subtitle, authorName } = req.body;
  
      global.db.run(
        "UPDATE Authors SET blog_title = ?, blog_subtitle = ?, author_name = ? WHERE author_id = ?",
        [blogTitle, subtitle, authorName, req.session.authorId],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            next(err);
          } else {
            res.redirect('/author');
          }
        }
      );
    });
  
/**
 * @desc Get likes count for an article
 * @route GET /author/article/:articleId/likes
 * @input articleId (from URL parameters)
 * @output Send a JSON response with the likes count for the article
 */
    router.get('/article/:articleId/likes', (req, res, next) => {
      const articleId = req.params.articleId;
    
      global.db.get(
        "SELECT COUNT(*) as likes_count FROM UserLikes WHERE article_id = ?",
        [articleId],
        function(err, result) {
          if (err) {
            next(err);
          } else {
            res.status(200).json({ likes_count: result.likes_count });
          }
        }
      );
    });
    
    // Return the router
    return router;
  };
  



