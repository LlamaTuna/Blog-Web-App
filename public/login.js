//login-js

document.addEventListener("DOMContentLoaded", function() {
  // Get the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get('message');

  // If there's a message, display it in an alert
  if (message) {
    window.alert(message);
  }

  // Add a submit event listener to the form
  var loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", function(event) {
    // Submit the form
    loginForm.submit();
  });
});
