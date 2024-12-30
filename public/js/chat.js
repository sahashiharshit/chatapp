document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chatMessages");
  let isLoading = false; // Prevent multiple concurrent loads
  let fetchInterval; // Reference to the setInterval
  const FETCH_INTERVAL_MS = 5000; // Interval duration
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
        const response = await fetch(
          "http://127.0.0.1:3000/chatapp/auth/users",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        this.users = data.users;
        const userlist = document.getElementById("users");
        userlist.innerHTML = `
         
         ${this.users.map((user) => `<li>${user.name}</li>`).join("")}
         `;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }

    displayMessages(scrollToBottom = true) {
      chatMessages.innerHTML = "";

      this.messages
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((data) => {
          const div = document.createElement("div");
          div.classList.add("message");

          // const p = document.createElement('p');
          // p.classList.add('meta');
          // //p.innerText = data.userId;
          // div.appendChild(p);

          const para = document.createElement("p");
          para.classList.add("text");
          para.innerText = data.message;
          div.appendChild(para);

          chatMessages.appendChild(div);
        });
      if (scrollToBottom) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }

    //Function to fetch messages
    async fetchMessages() {
    if(isLoading) return;
      try {
        //Load messages from localstorage
        const storedMessages =
          JSON.parse(localStorage.getItem("chatMessages")) || [];
        this.messages = storedMessages;
        
         // Check if the user is already at the bottom
         const isAtBottom = chatMessages.scrollTop + chatMessages.clientHeight >= chatMessages.scrollHeight -50;
         
        //Display Stored messages
        this.displayMessages(false);

        //Fetch new messages from the backend
        const lastMessage = this.messages[this.messages.length - 1];
        const lastTimestamp = lastMessage ? lastMessage.createdAt : "";

        const response = await fetch(
          `http://127.0.0.1:3000/chatapp/chat/messages?after=${encodeURIComponent(
            lastTimestamp
          )}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch Messages");
        }

        const newMessages = await response.json();

        //update Messages and local storage
        if (!Array.isArray(newMessages)) {
          throw new TypeError("newMessages is not iterable");
        }
        this.messages = [...this.messages, ...newMessages];
        this.trimOldMessages();
        this.saveMessagesToLocal();

        //Display all messages
        this.displayMessages(isAtBottom);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }

    trimOldMessages() {
      // const maxMessages = 10;
      // if (this.messages.length > maxMessages) {
      //   this.messages = this.messages.slice(-maxMessages);
      // }
    }

    saveMessagesToLocal() {
      //const recentMessages = this.messages.slice(-50);
      localStorage.setItem("chatMessages", JSON.stringify(this.messages));
    }

    //Function to fetch old messages

    async fetchOlderMessages() {
      if (isLoading) return;
      isLoading = true;

      const firstMessage = this.messages[0];
      const firstTimestamp = firstMessage ? firstMessage.createdAt : "";
      if (!firstTimestamp) {
        isLoading = false;
        return;
      }
      try {
        //Pause interval fetching
        clearInterval(fetchInterval);
        const response = await fetch(
          `http://127.0.0.1:3000/chatapp/chat/messages?before=${encodeURIComponent(
            firstTimestamp
          )}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch older messages");
        }

        const olderMessages = await response.json();

        if (!Array.isArray(olderMessages) || olderMessages.length === 0) {
          console.log("No older messages found.");
          isLoading = false;
          return;
        }
       
        const oldScrollHeight = chatMessages.scrollHeight;
        // Prepend older messages to the current list
        this.messages = [...olderMessages, ...this.messages];

        // Save updated messages to localStorage
        this.saveMessagesToLocal();

        // Display all messages
        this.displayMessages(false);
        // Adjust the scroll position to maintain the user's current view
        const newScrollHeight = chatMessages.scrollHeight;
        chatMessages.scrollTop = newScrollHeight - oldScrollHeight;
        
      } catch (error) {
        console.error("Error fetching older messages:", error);
      } finally {
        setTimeout(() => {
          fetchInterval = setInterval(
            () => this.fetchMessages(),
            FETCH_INTERVAL_MS
          );
        }, FETCH_INTERVAL_MS);
        isLoading = false;
      }
    }

    //function to send message to database
    async sendMessage(userId, message) {
      if (!message.trim()) return;

      try {
        const response = await fetch(
          "http://127.0.0.1:3000/chatapp/chat/sendmessage",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: userId, message: message }),
          }
        );

        if (response.ok) {
          this.fetchMessages(); // Refresh the messages after sending
          document.querySelector("#msg").value = ""; // Clear the message input
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
          this.navigate("login.html");
        } else {
          alert("Failed to logout. Please try again.");
        }
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
  }

  const chat = new Chat();
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("userId");
  const data = localStorage.getItem(`${userId}_data`);
  if (data) {
    chat.fetchUsers();
    chat.fetchMessages();
    // Start fetching new messages periodically
    fetchInterval = setInterval(() => chat.fetchMessages(), FETCH_INTERVAL_MS);
  } else {
    alert("Unauthorized user ");
    chat.navigate("login.html");
  }
  document.getElementById("chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const message = e.target.elements.msg.value;
    chat.sendMessage(userId, message);
  });

  chatMessages.addEventListener("scroll", async () => {
    console.log("scroll up");
    if (chatMessages.scrollTop === 0) {
      await chat.fetchOlderMessages();
    }
  });
});
