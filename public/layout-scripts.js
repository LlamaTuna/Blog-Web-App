//layout-scripts.js

window.onload = function() {
  // Get the theme toggle button and the navbar elements
  const themeToggle = document.getElementById('themeToggle');
  const navbar = document.querySelector('.navbar');

  // Check if there's a theme saved in localStorage
  if (localStorage.getItem('theme')) {
    // If there is, apply the saved theme to the body of the document
    document.body.className = localStorage.getItem('theme');
    // Also apply the appropriate theme to the navbar
    toggleNavbarTheme(localStorage.getItem('theme') === 'dark-theme');
  }

  // Add an event listener to the theme toggle button
  themeToggle.addEventListener('click', function() {
    // When the button is clicked, toggle the theme on the body of the document
    document.body.classList.toggle('dark-theme');

    // Save the current theme in localStorage
    localStorage.setItem('theme', document.body.className);

    // Toggle the theme on the navbar as well
    toggleNavbarTheme(document.body.className === 'dark-theme');
  });

  // Function to toggle the theme of the navbar
  function toggleNavbarTheme(isDarkTheme) {
    // If the theme is dark
    if (isDarkTheme) {
      // Remove the light theme classes and add the dark theme classes
      navbar.classList.remove('navbar-light', 'bg-light');
      navbar.classList.add('navbar-dark', 'bg-dark');
    } else {
      // If the theme is not dark (i.e., it's light), remove the dark theme classes and add the light theme classes
      navbar.classList.remove('navbar-dark', 'bg-dark');
      navbar.classList.add('navbar-light', 'bg-light');
    }
  }
}
