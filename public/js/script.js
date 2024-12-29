//main class to load pages according to requested page or authorized user
class Login {
  constructor() {
  
  }
  //helper function for navigation
  navigate(page) {
    window.location.href = page;
  }

  //function to check login form activities

  async submitLogin(email, password) {
    if (!email || !password) {
      alert("Both email and password are required.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/chatapp/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await response.json();
      //console.log(data.user);
      const token = data.token;
      const userId = data.user.id;
      if (response.ok) {
        alert("Login Successful");
        localStorage.setItem(`${userId}_data`,token);  
        this.navigate(`chatpage.html?userId=${userId}`);//pass userId in URL
      } else {
        alert("Login Failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    }
  }

  //function for checking sessions

  async checkSession() {
    try {
      const response = await fetch(
        "http://127.0.0.1:3000/chatapp/auth/check-session",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.active) {
        console.log("Session is active:", data.user);
        window.location.href = "chatpage.html";
      } else {
        console.log("Session is inactive. Redirecting to login.", data.message);
        window.location.href = "login.html";
      }
    } catch (error) {
      console.error("Error checking session:", error);
      window.location.href = "login.html";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginInstance = new Login();
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    loginInstance.submitLogin(email, password);
  });
});
