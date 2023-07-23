//article.js

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get the like count, like button, and back button elements
  var likeCount = document.getElementById('likeCount');
  var likeBtn = document.getElementById('likeBtn');
  var backButton = document.getElementById('backButton'); // Add this line
  // Get the article ID from the like button's data attribute
  var articleId = likeBtn.getAttribute('data-article-id');
  // Construct the URL for the likes API
  var actionUrl = "/reader/article/" + articleId + "/likes";

  // Fetch the updated likes count when the page loads
  var xhr = new XMLHttpRequest();
  xhr.open('GET', actionUrl);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        // Update the like count text
        likeCount.textContent = response.likes_count;
      } else {
        console.error('Error:', xhr.statusText);
      }
    }
  };
  xhr.send();

  // Add an event listener for the like button click
  likeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    var actionUrl = "/reader/article/" + articleId + "/like";

    var xhr = new XMLHttpRequest();
    xhr.open('POST', actionUrl);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var response = JSON.parse(xhr.responseText);
          // Update the like count text
          likeCount.textContent = response.likes_count;
        } else {
          console.error('Error:', xhr.statusText);
        }
      }
    };
    xhr.send();
  });

  // Add an event listener for the back button click
  backButton.addEventListener('click', function(e) {
    e.preventDefault();
    goBack();
  });

// Function to go back to the previous page
function goBack() {
  window.location.href = '/reader'; // replace '/reader' with the actual path to your reader page
}

});
