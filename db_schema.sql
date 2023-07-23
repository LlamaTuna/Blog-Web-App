--db_schema.sql
-- Enable the enforcement of foreign key constraints
PRAGMA foreign_keys=ON;

-- Start a transaction block
BEGIN TRANSACTION;

-- Create the 'Authors' table if it does not exist
-- This table will hold information about blog authors
CREATE TABLE IF NOT EXISTS Authors (
  author_id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Unique ID for the author
  author_name TEXT NOT NULL,                    -- Name of the author
  blog_title TEXT,                              -- Title of the author's blog
  blog_subtitle TEXT,                           -- Subtitle of the author's blog
  password_hash TEXT NOT NULL                   -- Hashed password for the author's account
);

-- Create the 'Articles' table if it does not exist
-- This table will hold information about the articles written by authors
CREATE TABLE IF NOT EXISTS Articles (
    article_id INTEGER PRIMARY KEY AUTOINCREMENT,   -- Unique ID for the article
    author_id INTEGER,                             -- ID of the author who wrote the article
    title TEXT NOT NULL,                           -- Title of the article
    subtitle TEXT,                                 -- Subtitle of the article
    text TEXT NOT NULL,                            -- Text content of the article
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Date and time the article was created
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date and time the article was last modified
    published_date TIMESTAMP,                         -- Date and time the article was published
    status TEXT CHECK (status IN ('draft', 'published')) NOT NULL DEFAULT 'draft', -- Publication status of the article
    likes INTEGER NOT NULL DEFAULT 0,                -- Number of likes the article has received
    FOREIGN KEY (author_id) REFERENCES Authors(author_id)  -- Reference to the 'Authors' table
);

-- Create the 'UserLikes' table if it does not exist
-- This table will hold information about which users liked which articles
CREATE TABLE IF NOT EXISTS UserLikes (
    user_id INTEGER,                                   -- ID of the user who liked the article
    article_id INTEGER,                                -- ID of the article that was liked
    PRIMARY KEY (user_id, article_id),                 -- Composite primary key consisting of the user ID and the article ID
    FOREIGN KEY (user_id) REFERENCES Authors(author_id),    -- Reference to the 'Authors' table
    FOREIGN KEY (article_id) REFERENCES Articles(article_id) -- Reference to the 'Articles' table
);

-- Create the 'Comments' table if it does not exist
-- This table will hold information about the comments made on articles
CREATE TABLE IF NOT EXISTS Comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,       -- Unique ID for the comment
    article_id INTEGER,                                -- ID of the article the comment was made on
    commenter_name TEXT NOT NULL,                      -- Name of the person who made the comment
    comment_body TEXT NOT NULL,                        -- Text content of the comment
    comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Date and time the comment was made
    FOREIGN KEY (article_id) REFERENCES Articles(article_id) -- Reference to the 'Articles' table
);

-- Create a trigger to delete comments when an article is deleted
CREATE TRIGGER delete_comments_on_article_delete 
    AFTER DELETE ON Articles
    BEGIN
        DELETE FROM Comments WHERE article_id = OLD.article_id;  -- Delete all comments associated with the deleted article
    END;

-- Insert four records into the 'Authors' table
INSERT INTO Authors (author_name, blog_title, blog_subtitle, password_hash)
VALUES
    ('Joe Martino', 'Jazz Guitar Journey', 'Exploring the world of Jazz Guitar', 'password'),
    ('Joe Martino', 'The Art of Cooking', 'Delicious recipes and culinary adventures', 'password'),
    ('Joe Martino', 'Tech Tales', 'Exploring the world of technology and programming', 'password'),
    ('Joe Martino', 'The Wine Journey', 'Exploring the world of Pinot Noir grapes and winemaking', 'password');

-- Insert four records into the 'Articles' table
INSERT INTO Articles (author_id, title, subtitle, text, status, likes)
VALUES
    (1, 'The Beauty of Jazz Guitar', 'Understanding its complexity', 'Jazz guitar is a beautiful and complex genre. It blends traditional guitar playing with elements of jazz to create a unique sound...', 'published', 0),
    (1, 'Cooking Salmon 101', 'Mastering the art of cooking salmon', 'Salmon is a versatile and delicious fish that can be prepared in various ways...', 'published', 0),
    (1, 'Introduction to JavaScript', 'Learn the fundamentals of JavaScript programming', 'JavaScript is a popular programming language used for building interactive web applications...', 'published', 0),
    (1, 'Exploring Pinot Noir Grapes', 'Unraveling the flavors and characteristics of Pinot Noir', 'Pinot Noir grapes are known for their delicate flavors and complexity...', 'published', 0);

-- Commit the transaction
COMMIT;
