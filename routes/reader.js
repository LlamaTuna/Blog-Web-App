// reader.js -- All reader routes
const express = require('express');
const router = express.Router();

/**
 * @desc Get all published articles
 * @route GET /reader
 * @input None
 * @output Render the reader's home page with all published articles
 */
router.get('/', (req, res, next) => {
  global.db.all(
    "SELECT Articles.*, Authors.author_name, (SELECT COUNT(*) FROM UserLikes WHERE UserLikes.article_id = Articles.article_id) AS likes_count FROM Articles \
     LEFT JOIN Authors ON Articles.author_id = Authors.author_id \
     WHERE status = 'published'",
    function (err, articles) {
      if (err) {
        next(err);
      } else {
        const formattedArticles = articles.map((article) => ({
          ...article,
          imageUrl: `/static/images/${Math.floor(Math.random() * 10) + 1}.jpg`,
        }));
        res.render('reader', {
          title: 'Reader',
          heroText: {
            title: 'Reader Home Page',
            subtitle: '',  // Add appropriate subtitle
            author: '',  // Add appropriate author
          },
          articles: formattedArticles,
        });             
      }
    }
  );
});

/**
 * @desc Get a specific article
 * @route GET /reader/article/:articleId
 * @input articleId (from request parameters)
 * @output Render the specific article page with its comments
 */
router.get('/article/:articleId', (req, res, next) => {
  const articleId = req.params.articleId;

  global.db.get(
    "SELECT Articles.*, Authors.author_name, (SELECT COUNT(*) FROM UserLikes WHERE Articles.article_id = UserLikes.article_id) AS likes_count FROM Articles \
    JOIN Authors ON Articles.author_id = Authors.author_id \
    WHERE Articles.article_id = ?",
    [articleId],
    function (err, article) {
      if (err) {
        next(err);
      } else {
        if (!article) {
          return next(new Error('Article not found'));
        }

        global.db.all(
          "SELECT * FROM Comments WHERE article_id = ? ORDER BY comment_date DESC",
          [articleId],
          function (err, comments) {
            if (err) {
              next(err);
            } else {
              res.render('article', { 
                title: article.title, 
                heroText: {
                  title: article.title,
                  subtitle: article.subtitle,
                  author: `By: ${article.author_name}`
                },
                article: article, 
                comments: comments,
                authorName: article.author_name
              });             
            }
          }
        );
      }
    }
  );
});

/**
 * @desc Post a new comment to an article
 * @route POST /reader/article/:articleId/comment
 * @input commenterName, commentBody (from request body), articleId (from request parameters)
 * @output Redirect to the article page after successful comment posting
 */
router.post('/article/:articleId/comment', (req, res, next) => {
  const { commenterName, commentBody } = req.body;
  const articleId = req.params.articleId;

  global.db.run(
    "INSERT INTO Comments (article_id, commenter_name, comment_body, comment_date) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
    [articleId, commenterName, commentBody],
    function(err) {
      if (err) {
        next(err);
      } else {
        res.redirect(`/reader/article/${articleId}`);
      }
    }
  );
});

/**
 * @desc Add a like to an article
 * @route POST /reader/article/:articleId/like
 * @input userId (from session), articleId (from request parameters)
 * @output JSON response with the updated likes count after successful like
 */
router.post('/article/:articleId/like', (req, res, next) => {
  const articleId = req.params.articleId;
  const userId = req.session.userId; // Assuming you are using session-based authentication

  // Check if the user has already liked the article
  global.db.get(
    "SELECT * FROM UserLikes WHERE user_id = ? AND article_id = ?",
    [userId, articleId],
    function (err, row) {
      if (err) {
        next(err);
      } else {
        // If user has already liked the article
        if (row) {
          res.status(400).json({ error: 'You have already liked this article.' });
        } else {
          // If user hasn't liked the article yet
          global.db.run(
            "INSERT INTO UserLikes (user_id, article_id) VALUES (?, ?)",
            [userId, articleId],
            function (err) {
              if (err) {
                next(err);
              } else {
                // Increment the likes count in the Articles table
                global.db.run(
                  "UPDATE Articles SET likes = likes + 1 WHERE article_id = ?",
                  [articleId],
                  function (err) {
                    if (err) {
                      next(err);
                    } else {
                      // Retrieve the updated likes count
                      global.db.get(
                        "SELECT likes FROM Articles WHERE article_id = ?",
                        [articleId],
                        function (err, result) {
                          if (err) {
                            next(err);
                          } else {
                            res.status(200).json({ likes_count: result.likes });
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
      }
    }
  );
});

/**
 * @desc Fetch the number of likes for an article
 * @route GET /reader/article/:articleId/likes
 * @input articleId (from request parameters)
 * @output JSON response with the likes count
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

module.exports = router;
