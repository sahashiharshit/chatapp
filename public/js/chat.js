import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.querySelector(".chat-messages");

  // Toggle Create Group Modal
  const openCreateGroup = document.getElementById("open-create-group");
  const closeCreateGroup = document.getElementById("close-create-group");
  const createGroupContainer = document.getElementById(
    "create-group-container"
  );
  const createGroupBtn = document.getElementById("create-group-btn");
  const modalOverlay = document.getElementById("modal-overlay");
  const participantsInput = document.getElementById("group-participants");
  const participantsList = document.getElementById("participants-list");
  const selectedList = document.getElementById("selected-participants");

  let grouptemporaryParticipants = [];

  let isLoading = false; // Prevent multiple concurrent loads

  //class chat
  class Chat {
    constructor() {
      this.users = [];
      this.messages = [];
      this.groups = [];
    }
    navigate(page) {
      window.location.href = page;
    }
    //function to get Groups details of particular user
    async getGroups(userId) {
      try {
        const response = await fetch(
          `http://127.0.0.1:3000/chatapp/groups/${userId}/groups`
        );
        const data = await response.json();

        this.groups = data;

        const grouplist = document.querySelector(".group-list");
        grouplist.innerHTML = " ";
        this.groups.forEach((group) => {
          const listitem = document.createElement("li");
          listitem.classList.add("group-item");

          listitem.dataset.id = group.id;
          listitem.innerHTML = `<i class="fa-solid fa-user-group"></i>&ThinSpace;${group.groupname}`;
          listitem.addEventListener("click", (event) =>
            this.showGroupMessage(group.id, userId)
          );
          grouplist.appendChild(listitem);
        });
      } catch (error) {
        console.log(error);
      }
    }

    async showGroupMessage(groupid, loggedInuserId) {
      const msgBox = document.getElementById("msg");
      msgBox.dataset.id = groupid;

      try {
        const response = await fetch(
          `http://127.0.0.1:3000/chatapp/chat/messages?groupId=${groupid}&userId=${loggedInuserId}`
        );

        const messages = await response.json();

        this.messages = messages.messages;
        this.displayMessages(true, loggedInuserId);
      } catch (error) {
        console.log(error);
      }
    }

    //function to display messages
    displayMessages(scrollToBottom = true, userid) {
      chatMessages.innerHTML = "";

      if (this.messages.length == 0) {
        const groupname = document.querySelector(".groupname");
        groupname.innerHTML = "";
        chatMessages.innerHTML = `<p class='errornomsg'>No messages in the group yet</p>`;
      } else {
        const groupname = document.querySelector(".groupname");
        groupname.textContent = `${this.messages[0].Group.groupname}`;
        // console.log(this.messages);
        this.messages
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map((data) => {
            const messageElement = document.createElement("div");
            let date = new Date(data.createdAt);
            let localtime = date.toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
            messageElement.classList.add(
              "message",
              data.user_id === userid ? "sent" : "received"
            );
            messageElement.innerHTML = `
          <div class="username">${data.sender.name
            .charAt(0)
            .toUpperCase()}${data.sender.name.slice(1)}</div>
          <p>${data.message}</p>
          <span class="timestamp">${localtime}</span>      
          `;
          chatMessages.appendChild(messageElement);
          });
      }
      if (scrollToBottom) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }

    //Function to fetch messages
    async fetchMessages() {
      if (isLoading) return;
      try {
        //Load messages from localstorage
        const storedMessages =
          JSON.parse(localStorage.getItem("chatMessages")) || [];
        this.messages = storedMessages;

        // Check if the user is already at the bottom
        const isAtBottom =
          chatMessages.scrollTop + chatMessages.clientHeight >=
          chatMessages.scrollHeight - 50;

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
    //saves messages in local storage
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
        isLoading = false;
      }
    }

    //function to send message to database
    async sendMessage(groupId, userId, message) {
      if (!message.trim()) return;
      socket.emit("sendMessage", { groupId, userId, message });
   
    }
    //For adding participant to a group
    addParticipantToList = (participant) => {
      const participantDiv = document.createElement("div");
      participantDiv.dataset.userId = participant.id;
      grouptemporaryParticipants.push(participant.id);

      participantDiv.innerHTML = `
        ${participant.name}
        <button class="remove-participant-btn">x</button>
      `;
      participantDiv
        .querySelector(".remove-participant-btn")
        .addEventListener("click", () => {
          this.removeParticipants(participant.id);
        });
      selectedList.appendChild(participantDiv);
      participantsInput.value = "";
      participantsList.innerHTML = "";
    };
    
    removeParticipants = (id) => {
      const participantItem = document.querySelector(`[data-user-id="${id}"]`);
      if (participantItem) participantItem.remove();

      grouptemporaryParticipants = grouptemporaryParticipants.filter(
        (participant) => participant.id !== id
      );
      grouptemporaryParticipants.pop(id);
    };

    //fetch participants to include in group
    fetchParticipants = async (query, userId) => {
      const response = await fetch(
        `http://127.0.0.1:3000/chatapp/groups/search-participants?query=${encodeURIComponent(
          query
        )}&userId=${encodeURIComponent(userId)}`
      );
      const participants = await response.json();
      return participants;
    };

    displayParticipantList = (participants) => {
      participantsList.innerHTML = "";

      participants.map((participant) => {
        const div = document.createElement("div");
        div.textContent = participant.name;
        div.dataset.userId = participant.id;
        div.classList.add("participant-item");

        div.addEventListener("click", () => {
          chat.addParticipantToList(participant);
        });
        participantsList.appendChild(div);
      });
    };

    //to store data of group and users in database
    saveGroupInfo = async (
      groupName,
      loggedInuserId,
      groupparticipantsList
    ) => {
      // Logic to send the group data to the backend
      try {
        const response = await fetch(`http://127.0.0.1:3000/chatapp/groups/`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            groupName: groupName,
            createdBy: loggedInuserId,
            groupparticipantsList: groupparticipantsList,
          }),
        });
        console.log(await response.json());
      } catch (error) {
        console.error(error);
      }
    };
    //code to logout
     logout(loggedInuserId) {
     
      const data = localStorage.getItem(`${loggedInuserId}_data`);

      if (data) {
        alert("Logout successful.");
        localStorage.removeItem(`${loggedInuserId}_data`);
        socket.disconnect();
        this.navigate("login.html");
      } else {
        alert("Failed to logout. Please try again.");
      }
    }

    getQueryParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }
    decodeQueryParams(data) {
      const decodedData = atob(data);
      return new URLSearchParams(decodedData);
    }
    displayInstantMessages(message,loggedInuserId){
      const messageElement = document.createElement("div");
            let date = new Date(message.timestamp);
            let localtime = date.toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
            messageElement.classList.add(
              "message",
              message.user_id === loggedInuserId ? "sent" : "received"
            );
            messageElement.innerHTML = `
            <div class="username">${message.sender
              .charAt(0)
              .toUpperCase()}${message.sender.slice(1)}</div>
            <p>${message.text}</p>
            <span class="timestamp">${localtime}</span>      
            `;
            chatMessages.appendChild(messageElement);
    }
  }

  const chat = new Chat();
  const encodedQueryParams = chat.getQueryParam("data");
  const params = chat.decodeQueryParams(encodedQueryParams);

  const loggedInuserId = params.get("userId");
  const socketId = params.get("socketId");
  const data = localStorage.getItem(`${loggedInuserId}_data`);
  if (!socketId || !loggedInuserId || !data) {
    alert("Invalid session. Please log in again.");
    chat.navigate("login.html"); // Redirect to login
  }
  const socket = io("http://localhost:3000", {
    query: { socketId, loggedInuserId, },
  });
  socket.on("connect",()=>{
    console.log("Connected with socket ID:", socket.id);
    
  });
  socket.on('socketIdUpdated',({socketId})=>{
  console.log("Updated Socket ID:",socketId);
  });
  
  chat.getGroups(loggedInuserId);

  socket.on("newMessage", (message) => {
    console.log("new Message ", message);
    //chat.messages.push(message.text);
    chat.displayInstantMessages(message,loggedInuserId);
  });
  
  //Event Listeners
  document.getElementById("logout").addEventListener("click",e=>{
  
    e.preventDefault();
    chat.logout(loggedInuserId);
  });
  
  document.getElementById("sendmsg").addEventListener("submit", (e) => {
    e.preventDefault();
    const message = e.target.elements.msg.value;
    const groupId = e.target.elements.msg.dataset.id;

    chat.sendMessage(groupId, loggedInuserId, message);
  });
  // chatMessages.addEventListener("scroll", async () => {
  //   console.log("scroll up");
  //   if (chatMessages.scrollTop === 0) {
  //     await chat.fetchOlderMessages();
  //   }
  // });

  //To open and close popup
  openCreateGroup.addEventListener("click", () => {
    createGroupContainer.style.display = "flex";
    modalOverlay.classList.remove("hidden");
  });
  closeCreateGroup.addEventListener("click", () => {
    createGroupContainer.style.display = "none";
    modalOverlay.classList.add("hidden");
    document.getElementById("group-name").value = "";
    participantsList.innerHTML = "";
    selectedList.innerHTML = "";
    participantsInput.value = "";
    grouptemporaryParticipants = [];
  });
  //Ends here

  //
  // ParticipantsInput eventlistener
  participantsInput.addEventListener("input", async (event) => {
    const query = event.target.value;
    if (query.length < 2) {
      participantsList.innerHTML = "";

      return;
    }
    try {
      const participants = await chat.fetchParticipants(query, loggedInuserId);

      chat.displayParticipantList(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  });

  //Create Group button eventListener

  createGroupBtn.addEventListener("click", async () => {
    const groupName = document.getElementById("group-name").value.trim();

    if (!groupName || grouptemporaryParticipants.length === 0) {
      alert("Please provide a group name and add at least one participant.");
      return;
    }

   await chat.saveGroupInfo(groupName, loggedInuserId, grouptemporaryParticipants);

    console.log("Group created Success");

    // Close the modal
    createGroupContainer.style.display = "none";
    modalOverlay.classList.add("hidden");
    document.getElementById("group-name").value = "";
    participantsList.innerHTML = "";
    selectedList.innerHTML = "";
    participantsInput.value = "";
    grouptemporaryParticipants = [];
    await chat.getGroups(loggedInuserId);
  });
});
