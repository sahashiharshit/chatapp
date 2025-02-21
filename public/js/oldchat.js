import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

document.addEventListener("DOMContentLoaded", () => {
  //html elements selected by selectors
  const chatMessages = document.querySelector(".chat-messages");
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
  const groupName = document.getElementById("groupName");
  const backToChats = document.getElementById("back-to-chats");
  const groupDetails = document.getElementById("group-details");
  const chat_section = document.querySelector('.chat-window');
  //
  //variables
  let grouptemporaryParticipants = [];
  let isLoading = false;
  let selectedGroupId = null;

  const SERVER_URL = "http://3.6.134.76:3000"||"http://localhost:3000";
  //Utility functions
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const sanitizeHTMl = (str) =>
    str.replace(
      /[&<>"']/g,
      (match) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        }[match])
    );

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
          `${SERVER_URL}/chatapp/groups/${userId}/groups`
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
            this.joinGroup(group.id, userId)
          );
          grouplist.appendChild(listitem);
        });
      } catch (error) {
        console.error("Error fetching groups:", error);
        alert("Unable to fetch groups. Please try again later.");
      }
    }
    //Joingroup method
    async joinGroup(groupid, loggedInuserId) {
      selectedGroupId = groupid;

      socket.emit("join-group", selectedGroupId);

      try {
        const response = await fetch(
          `${SERVER_URL}/chatapp/chat/messages?groupId=${selectedGroupId}&userId=${loggedInuserId}`
        );
        if (!response.ok) throw new Error("Failed to fetch messages");
        const groupMessages = await response.json();

        this.messages = groupMessages.slice(-20);

        this.saveMessagesToLocal();
        this.displayMessages(true, loggedInuserId);
      } catch (error) {
        console.log(error);
      }
    }

    async getUsersList(group_id, loggedInuserId) {
      try {
        const response = await fetch(
          `${SERVER_URL}/chatapp/groups/getUsers/${group_id}/${loggedInuserId}`
        );
        const data = await response.json();

        return data;
      } catch (error) {
        console.log(error);
      }
    }

    //function to display messages
    displayMessages(scrollToBottom = true, userid) {
      chatMessages.innerHTML = "";

      if (this.messages.length === 0) {
        const groupname = document.querySelector(".groupname");
        groupname.innerHTML = "";
        chatMessages.innerHTML = `<p class='errornomsg'>No messages in the group yet</p>`;
      } else {
        const groupname = document.querySelector(".groupname");
        groupname.textContent = `${this.messages[0].Group.groupname}`;
        groupname.setAttribute("id", `${this.messages[0].group_id}`);

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
          <div class="username">${sanitizeHTMl(data.sender.name)
            .charAt(0)
            .toUpperCase()}${sanitizeHTMl(data.sender.name.slice(1))}</div>
          <p>${sanitizeHTMl(data.message)}</p>
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
          `${SERVER_URL}/chatapp/chat/messages/${lastTimestamp}`
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
      // const recentMessages = this.messages.slice(-20);
      localStorage.setItem("chatMessages", JSON.stringify(this.messages));
    }

    //Function to fetch old messages
    async fetchOlderMessages(loggedInuserId) {
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

        const response = await fetch(
          `${SERVER_URL}/chatapp/chat/messages/${firstTimestamp}?groupId=${selectedGroupId}&userId=${loggedInuserId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch older messages");
        }

        const olderMessages = await response.json();

        if (!Array.isArray(olderMessages) || olderMessages.length === 0) {
          isLoading = false;
          return;
        }

        const oldScrollHeight = chatMessages.scrollHeight;
        // Prepend older messages to the current list
        this.messages = [...olderMessages, ...this.messages];

        // Save updated messages to localStorage
        this.saveMessagesToLocal();

        // Display all messages
        this.displayMessages(false, loggedInuserId);
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
    async sendMessage(userId, message) {
      if (!message.trim()) return;
        socket.emit("sendMessage", { groupId: selectedGroupId, userId, message });
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
        `${SERVER_URL}/chatapp/groups/search-participants?query=${encodeURIComponent(
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
        const response = await fetch(`${SERVER_URL}/chatapp/groups/`, {
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
        localStorage.removeItem("chatMessages");
        socket.disconnect();
        this.navigate("login.html");
      } else {
        alert("Failed to logout. Please try again.");
      }
    }

   
    displayInstantMessages(message, loggedInuserId, scrollToBottom = true) {
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

      if (scrollToBottom) chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async removeMember(group_id, user_id) {
      //code to remove user from current group
      try {
        const response = await fetch(
          `${SERVER_URL}/chatapp/groups/removeUser`,
          {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({
              group_id,
              user_id,
            }),
          }
        );
        const result = await response.json();

        return result;
      } catch (error) {
        console.log(error);
      }
    }
    async makeUserAdmin(group_id, user_id) {
      //code to make and user admin of current group
      try {
        const response = await fetch(
          `${SERVER_URL}/chatapp/groups/makeUserAdmin`,
          {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({
              group_id,
              user_id,
            }),
          }
        );
        const result = await response.json();
      
        return result;
      } catch (error) {
        console.error(error);
      }
    }
  }

  const chat = new Chat();
  const encodedQueryParams = chat.getQueryParam("data");
  const params = chat.decodeQueryParams(encodedQueryParams);

  const loggedInuserId = params.get("userId");
  const socketId = params.get("socketId");
  const data = localStorage.getItem(`${loggedInuserId}_data`);
  if (!socketId || !loggedInuserId || !data) {
   
    chat.navigate("login.html"); // Redirect to login
  }
  const socket = io(SERVER_URL, {
    query: { socketId, loggedInuserId },
  });
  socket.on("connect", () => {
    //console.log("Connected with socket ID:", socket.id);
  });
  socket.on("socketIdUpdated", ({ socketId }) => {
    //console.log("Updated Socket ID:", socketId);
  });

  chat.getGroups(loggedInuserId);

  socket.on("newMessage", (message) => {
    if (message.groupId !== selectedGroupId) return;
    chat.displayInstantMessages(message, loggedInuserId);
  });

  //Event Listeners
  document.getElementById("logout").addEventListener("click", (e) => {
    e.preventDefault();
    chat.logout(loggedInuserId);
  });

  //sending messages eventlistener
  document.getElementById("sendmsg").addEventListener("submit", (e) => {
    e.preventDefault();
    const message = sanitizeHTMl(e.target.elements.msg.value.trim());
    if (!message || !selectedGroupId) return;

    chat.sendMessage(loggedInuserId, message);
    e.target.elements.msg.value = "";
  });

  chatMessages.addEventListener(
    "scroll",
    debounce(async () => {
      if (chatMessages.scrollTop === 0) {
        await chat.fetchOlderMessages(loggedInuserId);
      }
    }, 300)
  );

  //Open and close userlist popup
  groupName.addEventListener("click", async () => {
   
    const userlist = document.getElementById("user-list");
    const groupname = document.querySelector(".groupname");
    const group_id = groupname.getAttribute("id");
    if (groupname.innerText == "") {
      return;
    }
   

    const users = await chat.getUsersList(group_id, loggedInuserId);
    const { members, isLoggedInUserAdmin } = users;

    userlist.innerHTML = "";
    members.forEach((member) => {
      const listitem = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = `${member.userName} ${
        member.isAdmin ? "(Admin)" : "(Member)"
      }`;
      listitem.appendChild(span);
      if (isLoggedInUserAdmin && !member.isAdmin) {
        //Remove button logic
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.className = "remove-btn";
        removeButton.onclick = async () => {
          if (confirm("Do you want to remove this user?")) {
            const sucess = await chat.removeMember(group_id, member.userId);
            if (sucess) {
              listitem.remove();
            } else {
              alert("Failed to remove user! try again later");
            }
          } else {
            return;
          }
        };
        //make admin button logic
        const makeAdminButton = document.createElement("button");
        makeAdminButton.textContent = "Make Admin";
        makeAdminButton.className = "make-admin";
        makeAdminButton.onclick = async () => {
          if (confirm("Do you want to make this member an admin?")) {
            const sucess = await chat.makeUserAdmin(group_id, member.userId);
            if (sucess) {
              alert("User has been successfully made an admin.");
              
              const memberLabel =
                makeAdminButton.parentNode.querySelector("span");
              if (memberLabel) {
                memberLabel.textContent = `${member.userName} (Admin)`;
              }
              // Remove the "Make Admin" button as it's no longer relevant
              makeAdminButton.remove();
              removeButton.remove();
            } else alert("Failed to update user status");
          } else {
            return;
          }
        };
        listitem.appendChild(makeAdminButton);
        listitem.appendChild(removeButton);
      }
      userlist.appendChild(listitem);
    });
    chat_section.classList.add('hidden');
    groupDetails.classList.remove('hidden');
    
  });
  //back to chat button
  backToChats.addEventListener("click", () => {
    groupDetails.classList.add("hidden");
    chat_section.classList.remove("hidden");
  });
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
    const groupName = sanitizeHTMl(
      document.getElementById("group-name").value.trim()
    );

    if (!groupName || grouptemporaryParticipants.length === 0) {
      alert("Please provide a group name and add at least one participant.");
      return;
    }

    await chat.saveGroupInfo(
      groupName,
      loggedInuserId,
      grouptemporaryParticipants
    );
    
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
