// Hardcoded user data
const users = {
    prof380: {
      password: "abc123",
      pictures: ["nyit-logo.jpg"]
      
    },
    
  };
  
  const loginForm = document.getElementById("loginForm");
  const personalizedContent = document.getElementById("personalizedContent");
  const errorMessage = document.getElementById("errorMessage");
  const userGreeting = document.getElementById("userGreeting");
  const imagesContainer = document.getElementById("images");
  const logoutButton = document.getElementById("logoutButton");
  
  // Handle form submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent form submission
  
    const username = document.getElementById("username").value.toLowerCase();
    const password = document.getElementById("password").value;
  
    if (users[username] && users[username].password === password) {
      // Clear error message and show personalized content
      errorMessage.textContent = "";
      loginForm.style.display = "none";
      personalizedContent.style.display = "block";
      userGreeting.textContent = username.charAt(0).toUpperCase() + username.slice(1);
  
      // Load user's pictures
      imagesContainer.innerHTML = "";
      users[username].pictures.forEach((url) => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "User-specific picture";
        imagesContainer.appendChild(img);
      });
    } else {
      // Show error message
      errorMessage.textContent = "Invalid username or password.";
    }
  });
  
  // Logout function
  logoutButton.addEventListener("click", () => {
    personalizedContent.style.display = "none";
    loginForm.style.display = "block";
    loginForm.reset();
  });
  