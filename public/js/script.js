class PageLoader {
  constructor(containerId) {
    this.mainContainer = document.getElementById(containerId);
    
    if (!this.mainContainer) {
      throw new Error(`Container with ID "${containerId}" not found.`);
    }
  }

  async loadPage(page='signup.html') {
    try {
      const response = await fetch(`/${page}`);
      const html = await response.text();
      this.mainContainer.innerHTML = html;

      // Initialize events based on the loaded page
      if (page === "signup.html") {
        this.initSignupPage();
      } else if (page === "login.html") {
        this.initLoginPage();
      }
      else if(page==="chatpage.html"){
        this.initChatWindow();
      }
    } catch (error) {
      console.error("Error loading page:", error);
      this.mainContainer.innerHTML = `<p>Error loading page. Please try again later.</p>`;
    }
  }

  initSignupPage() {
    const signupForm = document.getElementById("signinform");
    if (!signupForm) {
      console.error("Signup form not found!");
      return;
    }
    
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = document.getElementById("name")?.value.trim();
      const email = document.getElementById("email")?.value.trim();
      const phoneno = document.getElementById("phoneno")?.value.trim();
      const password = document.getElementById("password")?.value.trim();
  
      try {
        const response = await fetch(
          "http://localhost:3000/chatapp/auth/create-new-user",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, phoneno, password }),
          }
        );
        const result = await response.json();
  
        if (response.ok) {
          alert("Signup Successfull");
          this.loadPage("login.html");
        } else {
          alert(result.message || "Signup Failed");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
      }
      
      // Load login page
    });

    const loginLink = document.getElementById("loginLink");
    if (!loginLink) {
      console.error("Login link not found!");
      return;
    }
    loginLink.addEventListener("click", (event) => {
      event.preventDefault();
      this.loadPage("login.html"); // Load login page
    });
  }

  initLoginPage() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) {
      console.error("Login form not found!");
      return;
    }
    loginForm.addEventListener("submit", async(event) => {
      event.preventDefault();
      
      const email = document.getElementById("email")?.value.trim();
      const password = document.getElementById("password")?.value.trim();
      try {
        const response = await fetch(
          "http://localhost:3000/chatapp/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          }
        );
        
        if (response.ok) {
          alert("Login Successfull");
         
          this.loadPage("chatpage.html");
        } else {
          alert(result.message || "login Failed");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
      }
     
    });
    
    
    const registerLink = document.getElementById("registerlink");
    if (!registerLink) {
      console.error("Sign up link not found!");
      return;
    }
    registerLink.addEventListener("click", (event) => {
      event.preventDefault();
      this.loadPage("signup.html"); // Load login page
    });
  }
  
  
  initChatWindow(){
  
    const userListContainer = document.getElementById('userList');
    const chatmessagesContainer = document.getElementById("chatMessages");
    const chatInput = document.getElementById("chatInput");
    const sendBtn = document.getElementById('sendBtn');
    this.fetchLoggedInUsers(userListContainer);
  
    sendBtn.addEventListener("click",async()=>{
    const message = chatInput.value.trim();
    if(message){
    // this.appendMessage("You", message, chatmessagesContainer);
    // chatInput.value="";
    try {
      const response = await fetch("http://127.0.0.1:3000/chatapp/post/chat",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message,userId }),
      });
    } catch (error) {
      console.error("Error:",error);
    }
    
    }
    });
    
    setTimeout(()=>{
    
      this.appendMessage("Other User", "Hello",chatmessagesContainer);
    },2000);
  };
  
  async fetchLoggedInUsers(container) {
    try {
      const response = await fetch("http://127.0.0.1:3000/chatapp/users");
      const users = await response.json();
      container.innerHTML = users.users
        .map((user) => `<div class="user">${user.name}</div>`)
        .join("");
    } catch (error) {
      console.error("Error fetching users:", error);
      container.innerHTML = `<p>Could not load users.</p>`;
    }
  }

  appendMessage(sender, message, container) {
    const messageElement = document.createElement("div");
    messageElement.className = "message";
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    container.appendChild(messageElement);

    // Auto-scroll to the latest message
    container.scrollTop = container.scrollHeight;
  }
  
}

   

document.addEventListener('DOMContentLoaded',()=>{
  const pageLoader = new PageLoader('main-container');
  pageLoader.loadPage();
});
