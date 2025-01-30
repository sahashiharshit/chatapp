import { fetchData, sanitizeHTML } from "./Utilities.js";
import MessageHandler from "./MessageHandler.js";
import GroupManager from "./GroupManager.js";
//Chat application
class ChatApp {
  constructor(apiBaseUrl, loggedinUserId, socket) {
    this.apiBaseUrl = apiBaseUrl;
    this.loggedinUserId = loggedinUserId;
    this.socket = socket;

    this.selectedGroupId = null;
    this.cachedElements = this.cacheDOMElements();
    this.messages = [];
    this.grouptemporaryParticipants = [];
    // Initialize external modules
    this.messageHandler = new MessageHandler(this.apiBaseUrl, this.socket);
    this.groupManager = new GroupManager(this.apiBaseUrl);
    this.bindEventListeners();
    this.initSocketEvents();
  }

  //Cache DOM Elements for performance

  cacheDOMElements() {
    return {
      chatMessages: document.querySelector(".chat-messages"),
      openCreateGroup: document.querySelector("#open-create-group"),
      closeCreateGroup: document.querySelector("#close-create-group"),
      createGroupContainer: document.querySelector("#create-group-container"),
      createGroupBtn: document.querySelector("#create-group-btn"),
      modalOverlay: document.querySelector("#modal-overlay"),
      participantsInput: document.querySelector("#group-participants"),
      groupList: document.querySelector(".group-list"),
      participantList: document.querySelector("#participants-list"),
      selectedList: document.querySelector("#selected-participants"),
      groupName: document.querySelector(".groupname"),
      userlist : document.querySelector("#user-list"),
      backToChats: document.querySelector("#back-to-chats"),
      groupDetails: document.querySelector("#group-details"),
      chat_section: document.querySelector(".chat-window"),
      loader: document.querySelector("#loader"),
      sendMessage: document.querySelector("#sendmsg"),
      logoutButton: document.querySelector("#logout"),
    };
  }
  //Event Listeners
  bindEventListeners() {
    const {
      sendMessage,
      logoutButton,
      openCreateGroup,
      closeCreateGroup,
      participantsInput,
      createGroupBtn,
      backToChats,
      createGroupContainer,
      groupName,
      chatMessages,
      modalOverlay,
      participantList,
      selectedList,
      chat_section,
      groupDetails,
      userlist
    } = this.cachedElements;

    sendMessage.addEventListener("submit", (e) => {
      e.preventDefault();

      const message = e.target.elements.msg.value.trim();
      this.sendMessage(message);
      e.target.elements.msg.value = "";
    });
    openCreateGroup.addEventListener("click", () => {
      createGroupContainer.style.display = "flex";
      modalOverlay.classList.remove("hidden");
      participantList.innerHTML = "";
    });
    closeCreateGroup.addEventListener("click", () => {
      createGroupContainer.style.display = "none";
      modalOverlay.classList.add("hidden");
      groupName.value = "";

      selectedList.innerHTML = "";
      participantsInput.innerHTML = "";
      this.grouptemporaryParticipants = [];
    });

    participantsInput.addEventListener("input", async (event) => {
      const query = event.target.value;
      if (query.length < 2) {
        participantList.innerHTML = "";
        return;
      }
      const participants = await this.fetchParticipants(query);
      this.displayParticipantList(participants);
    });

    createGroupBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const groupname = sanitizeHTML(groupName.value.trim());
      if (!groupname || this.grouptemporaryParticipants.length === 0) {
        alert("Please provide a group name and add at least one participant.");
        return;
      }
      const response = await this.saveGroupInfo(
        groupname,
        this.grouptemporaryParticipants
      );
      // console.log(response);
      if (!response) {
        return;
      }
      createGroupContainer.style.display = "none";
      modalOverlay.classList.add("hidden");
      groupName.value = "";
      participantList.innerHTML = "";
      selectedList.innerHTML = "";
      participantsInput.value = "";
      this.grouptemporaryParticipants = [];
      // await this.fetchGroups();
    });
    backToChats.addEventListener("click", () => {
      groupDetails.classList.add("hidden");
      chat_section.classList.remove("hidden");
    });
    groupName.addEventListener("click", async () => {

      const group_id = groupName.getAttribute("id");
      console.log(group_id);
      if (groupName.innerText == "") {
        return;
      }

      const users = await this.groupManager.getUserlist(group_id, this.loggedinUserId);
     // const { members, isLoggedInUserAdmin } = users;
        console.log(users);
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
              const sucess = await this.groupManager.removeMember(group_id, member.userId);
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
              const sucess = await this.groupManager.makeUserAdmin(group_id, member.userId);
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
    chatMessages.addEventListener("scroll", () => {});
    logoutButton.addEventListener("click", () => this.logout());
  }

  //Initialize Socket.IO evnets
  initSocketEvents() {
    this.socket.off("newMessage");
    this.socket.on("newMessage", (data) => {
      if (data.groupId !== this.selectedGroupId) return;
      this.renderInstantMessages(data);
    });
    
    this.socket.on("groupCreated",({groupId,groupName,members})=>{
    console.log(groupId,groupName,members);
      if(members.inculdes(this.loggedinUserId)){
        this.fetchGroups();
      }
    });
  }

  // Display loading spinner
  showLoader(show = true) {
    this.cachedElements.loader.style.display = show ? "block" : "none";
  }

  // Fetch groups from the server
  async fetchGroups() {
    try {
      const groups = await this.groupManager.fetchGroups(this.loggedinUserId);

      this.renderGroups(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  }

  // Render groups in the UI
  renderGroups(groups) {
    const { groupList } = this.cachedElements;
    groupList.innerHTML = "";

    groups.forEach((group) => {
      const groupItem = document.createElement("li");
      groupItem.className = "group-item";
      groupItem.innerText = group.groupname;
      groupItem.addEventListener("click", () =>
        this.selectGroup(group.id, this.loggedinUserId)
      );
      groupList.appendChild(groupItem);
    });
  }

  // Select a group and load messages
  async selectGroup(groupId) {
    this.selectedGroupId = groupId;
    this.socket.emit("join-group", this.selectedGroupId);
    const { messages, groupname } = await this.messageHandler.fetchMessages(
      this.selectedGroupId,
      this.loggedinUserId
    );
    this.renderMessages({ messages, groupname });
  }

  // Render messages in the chat
  renderMessages(data, scrollToBottom = true) {
    const { chatMessages, groupName } = this.cachedElements;
    chatMessages.innerHTML = "";
    this.messages = data.messages || [];
    
    const groupnameText = data.groupname.groupname || "No Group";
    groupName.textContent = groupnameText;
    groupName.setAttribute("id", `${data.groupname.id}`);
    if (this.messages.length > 0) {
      groupName.setAttribute("id", `${data.groupname.id}`);
    }

    if (this.messages.length === 0) {
      chatMessages.innerHTML = `<p class='errornomsg'>No messages in the group yet</p>`;
    } else {
      this.messages
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .forEach((message) => {
          const messageElement = document.createElement("div");
          let date = new Date(message.createdAt);
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
            message.user_id === this.loggedinUserId ? "sent" : "received"
          );
          messageElement.innerHTML = `
    <div class="username">${sanitizeHTML(message.sender.name)
      .charAt(0)
      .toUpperCase()}${sanitizeHTML(message.sender.name.slice(1))}</div>
    <p>${sanitizeHTML(message.message)}</p>
    <span class="timestamp">${localtime}</span>      
    `;
          chatMessages.appendChild(messageElement);
        });
    }
    if (scrollToBottom) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  renderInstantMessages(message, scrollToBottom = true) {
    const { chatMessages } = this.cachedElements;
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
      message.user_id === this.loggedinUserId ? "sent" : "received"
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

  // Send a new message
  async sendMessage(message) {
    if (!message || !this.selectedGroupId) return;

    try {
      await this.messageHandler.sendMessage(
        this.selectedGroupId,
        this.loggedinUserId,
        message
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  fetchParticipants = async (query) => {
    const data = await this.groupManager.fetchParticipants(
      query,
      this.loggedinUserId
    );

    return data;
  };

  displayParticipantList = (participants) => {
    //console.log(participants);
    const { participantList } = this.cachedElements;
    participantList.innerHTML = "";

    participants.map((participant) => {
      const div = document.createElement("div");
      div.textContent = participant.name;
      div.dataset.userId = participant.id;
      div.classList.add("participant-item");

      div.addEventListener("click", () => {
        this.addParticipantToList(participant);
      });
      participantList.appendChild(div);
    });
  };

  addParticipantToList = (participant) => {
    const { participantList, participantsInput, selectedList } =
      this.cachedElements;

    const participantDiv = document.createElement("div");
    participantDiv.dataset.userId = participant.id;
    this.grouptemporaryParticipants.push(participant.id);

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
    participantList.innerHTML = "";
  };

  removeParticipants = (id) => {
    const participantItem = document.querySelector(`[data-user-id="${id}"]`);
    if (participantItem) participantItem.remove();

    this.grouptemporaryParticipants = this.grouptemporaryParticipants.filter(
      (participant) => participant.id !== id
    );
    this.grouptemporaryParticipants.pop(id);
  };

  saveGroupInfo = async (groupname, grouptemporaryParticipants) => {
    return await this.groupManager.createNewGroup(
      groupname,
      this.loggedinUserId,
      grouptemporaryParticipants
    );
  };
  
  
  // Logout user
  logout() {
    localStorage.removeItem(this.loggedinUserId + "_data");
    localStorage.removeItem(this.loggedinUserId + "_socketId");
    localStorage.removeItem("chatMessages");
    this.socket.disconnect();
    window.location.href = "index.html";
  }
}

export default ChatApp;
