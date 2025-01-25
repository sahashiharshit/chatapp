//main class to load pages according to requested page or authorized user
import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";


document.addEventListener("DOMContentLoaded", () => {
 
  const SERVER_URL ="http://3.6.134.76:3000"||"http://localhost:3000";

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
        const response = await fetch(`${SERVER_URL}/chatapp/auth/login`, {
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
        const user_id = data.user.id;
        if (response.ok) {
          const socket = io(SERVER_URL);
          
          alert("Login Successful");
          socket.on('connect',()=>{
            const socketId = socket.id;
            const userId = user_id;
            localStorage.setItem(`${userId}_data`,token);
            const encodedParams = btoa(`userId=${encodeURIComponent(userId)}&socketId=${encodeURIComponent(socketId)}`);
            this.navigate(`chatpage.html?data=${encodedParams}`);//pass userId in URL
          });
           
          
          
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
