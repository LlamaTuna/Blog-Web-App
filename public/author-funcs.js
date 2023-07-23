//author-funcs.js

// Function to handle button click
function handleButtonClick(buttonElement) {
  // Get the href from the button's data attribute
  var href = buttonElement.getAttribute("data-href");
  // Redirect to the href
  location.href = href;
}

// Function to handle publish button click
function handlePublishButtonClick(buttonElement) {
  // Get the article ID and title from the button's data attributes
  var articleId = buttonElement.getAttribute("data-article-id");
  var articleTitle = buttonElement.getAttribute("data-article-title");

  // Confirm the publish action
  const confirmation = window.confirm(`Are you sure you want to publish ${articleTitle}?`);

  if (confirmation) {
    // Send a GET request to publish the article
    fetch(`/author/publish/${articleId}`, {
      method: 'GET',
    }).then(response => {
      if (response.ok) {
        // Reload the page if the publish was successful
        location.reload();
      } else {
        console.error('Publishing failed');
      }
    });
  }
}

// Function to handle delete button click
function handleDeleteButtonClick(buttonElement) {
  // Get the article ID and title from the button's data attributes
  var articleId = buttonElement.getAttribute("data-article-id");
  var articleTitle = buttonElement.getAttribute("data-article-title");

  // Confirm the delete action
  const confirmation = window.confirm(`Do you want to permanently delete ${articleTitle}?`);

  if (confirmation) {
    // Send a DELETE request to delete the article
    fetch(`/author/article/${articleId}`, {
      method: 'DELETE',
    }).then(response => {
      if (response.ok) {
        // Reload the page if the delete was successful
        location.reload();
      } else {
        console.error('Delete failed');
      }
    });
  }
}

// Function to handle share button click
function handleShareButtonClick(buttonElement) {
// Get the article ID from the button's data attribute
var articleId = buttonElement.getAttribute("data-article-id");
// Construct the share URL
var shareUrl = window.location.origin + '/reader/article/' + articleId;
// Construct the share prompt
var sharePrompt = "Copy the following URL to share this article:\n" + shareUrl;

// Show a prompt with the share URL
prompt(sharePrompt, shareUrl);
}

// When the page is loaded, fetch likes for all articles.
window.addEventListener('DOMContentLoaded', (event) => {
// Get all elements with an ID starting with "likes_" and fetch their likes
document.querySelectorAll('[id^="likes_"]').forEach(getArticleLikes);
});

// Function to fetch likes for an article
function getArticleLikes(likesElement) {
// Get the article ID from the element's data attribute
var articleId = likesElement.getAttribute("data-article-id");

// Send a GET request to fetch the likes
fetch(`/author/article/${articleId}/likes`)
  .then(response => response.json())
  .then(data => {
    // Update the likes text
    likesElement.innerText = data.likes_count;
  })
  .catch(console.error);
}

// Call updateLikesCount for each article initially and then every 5 seconds
document.addEventListener('DOMContentLoaded', () => {
// Get all article IDs from elements with an ID starting with "likes_"
const articleIds = Array.from(document.querySelectorAll('[id^="likes_"]')).map(el => el.id.slice(6));
// Update the likes count for each article
articleIds.forEach(articleId => updateLikesCount(articleId));
// Set an interval to update the likes count every 5 seconds
setInterval(() => {
  articleIds.forEach(articleId => updateLikesCount(articleId));
}, 5000);
});

// Function to update the likes count for an article
function updateLikesCount(articleId) {
// Send a GET request to fetch the likes
fetch(`/author/article/${articleId}/likes`)
  .then(response => response.json())
  .then(data => {
    // Get the likes element
    const likesElement = document.getElementById(`likes_${articleId}`);
    // Update the likes text
    likesElement.textContent = data.likes_count;
  });
}
