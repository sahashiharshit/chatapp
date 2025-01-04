//main class to load pages according to requested page or authorized user
import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";


document.addEventListener("DOMContentLoaded", () => {
  const socket = io('http://localhost:3000');

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
       
        const token = data.token;
        const userId = data.user.id;
        if (response.ok) {
          
          alert("Login Successful");
          const socketId = socket.id;
          localStorage.setItem(`${userId}_data`,token);  
         const encodedParams = btoa(`userId=${encodeURIComponent(userId)}&socketId=${encodeURIComponent(socketId)}`)
          this.navigate(`chatpage.html?data=${encodedParams}`);//pass userId in URL
        } else {
          alert("Login Failed");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
      }
    }
   
    //function for checking sessions
  
   
  }




  const loginInstance = new Login();
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    loginInstance.submitLogin(email, password);
  });
});
