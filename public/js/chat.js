class Chat {
  constructor() {
    this.users = [];
    this.messages = [];
    
    }
  navigate(page) {
    window.location.href = page;
  }
  async fetchUsers() {
    try {
      const response = await fetch("http://127.0.0.1:3000/chatapp/auth/users",{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
     const data = await response.json();
    
     
      this.users = data.users;
       const userlist= document.getElementById('users');
       userlist.innerHTML=`
       
       ${this.users
       .map(user=>`<li>${user.name}</li>`)
       .join('')}
       `;
       
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }
  async fetchMessages() {
    try {
      const response = await fetch(
        "http://127.0.0.1:3000/chatapp/chat/messages"
      );
      const data = await response.json();
      
      this.messages = data;
     // console.log(this.messages);
     document.querySelector('.chat-messages').innerHTML='';
     
    
    this.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(data=>{
      const div = document.createElement('div');
      div.classList.add('message');
      
      // const p = document.createElement('p');
      // p.classList.add('meta');
      // //p.innerText = data.userId;
      // div.appendChild(p);
      
      const para = document.createElement('p');
      para.classList.add('text');
      para.innerText = data.message;
      div.appendChild(para);
       
      document.querySelector('.chat-messages').appendChild(div);
    });
    
     
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }
  
  //function to send message to database
  async sendMessage(userId,message) {
    if (!message.trim()) return;

    try {
      const response = await fetch(
        "http://127.0.0.1:3000/chatapp/chat/sendmessage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({userId:userId, message:message }),
        }
      );

      if (response.ok) {
        this.fetchMessages();
        document.querySelector('#msg').value='';
      }
      console.log(this.messages);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
  
  
  //code to logout
  async logout() {
    try {
      const response = await fetch(
        "http://127.0.0.1:3000/chatapp/auth/logout",
        {
          method: "POST",
          //  credentials: "include",
        }
      );

      if (response.ok) {
        alert("Logout successful.");
        Login.navigate("login.html");
      } else {
        alert("Failed to logout. Please try again.");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }
}
document.addEventListener("DOMContentLoaded", () => {
 const chat = new Chat();
 const params = new URLSearchParams(window.location.search);
 const userId = params.get('userId');
 const data = localStorage.getItem(`${userId}_data`);
 if(data){
  chat.fetchUsers();
  chat.fetchMessages();
  
  
 
 }else{
 alert("Unauthorized user ");
 chat.navigate('login.html');
 }
 document.getElementById('chat-form').addEventListener('submit',(e)=>{
  
  e.preventDefault();
  const message = e.target.elements.msg.value;
  chat.sendMessage(userId,message);
  });
  
  setInterval(()=>{
    chat.fetchMessages();
    
  },2000);
});
