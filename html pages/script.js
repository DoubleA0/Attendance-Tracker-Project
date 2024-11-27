// Hardcoded user data
const users = {
    prof380: {
      password: "abc123",
      
      
    },
    
  };
  
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");
  
  // Handle login submission
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Prevent form submission
  
      const username = document.getElementById("username").value.toLowerCase();
      const password = document.getElementById("password").value;
  
      if (users[username] && users[username].password === password) {
        // Redirect to the next page after successful login
        window.location.href = "Home.html"; // Replace with your next page's file path
      } else {
        // Show an error message if login fails
        errorMessage.textContent = "Invalid username or password.";
      }
    });
  }
  
  // Handle logout button click on the next page
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    console.log("Logout button detected"); // Debugging log
    logoutButton.addEventListener("click", () => {
      console.log("Logout button clicked"); // Debugging log
      // Redirect back to the login page
      window.location.href = "login.html";
    });
  }