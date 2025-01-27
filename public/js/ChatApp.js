
import MessageHandler from './MessageHandler.js';
import GroupManager from './GroupManager.js'
//Chat application
class ChatApp {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
    this.socket = io(apiBaseUrl);
    // this.user = JSON.parse(localStorage.getItem("user"));
    this.selectedGroupId = null;
    this.cachedElements = this.cacheDOMElements();

    // Initialize external modules
    this.messageHandler = new MessageHandler(this.apiBaseUrl, this.user.token);
    this.groupManager = new GroupManager(this.apiBaseUrl, this.user.token);
    this.bindEventListeners();
    this.initSocketEvents();
  }
  
  getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  decodeQueryParams(data) {
    const decodedData = atob(data);
    return new URLSearchParams(decodedData);
}

  //Cache DOM Elements for performance

  cacheDOMElements() {
    return {
      groupList: document.querySelector("#group-list"),
      messageList: document.querySelector("#message-list"),
      participantList: document.querySelector("#participant-list"),
      groupModal: document.querySelector("#group-modal"),
      participantModal: document.querySelector("#participant-modal"),
      loader: document.querySelector("#loader"),
      sendMessageInput: document.querySelector("#send-message-input"),
      sendMessageButton: document.querySelector("#send-message-button"),
      logoutButton: document.querySelector("#logout-button"),
    };
  }

  bindEventListeners() {
    const { sendMessageButton, sendMessageInput, logoutButton } =
      this.cachedElements;

    sendMessageButton.addEventListener("click", () => this.sendMessage());
    sendMessageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.sendMessage();
    });
    logoutButton.addEventListener("click", () => this.logout());
  }

  //Initialize Socket.IO evnets
  initSocketEvents() {
    this.socket.on("message", (data) => this.receiveMessage(data));
  }

  // Display loading spinner
  showLoader(show = true) {
    this.cachedElements.loader.style.display = show ? "block" : "none";
  }

  // Fetch groups from the server
  async fetchGroups(userId) {
    try {
      const groups = await this.groupManager.fetchGroups(userId);
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
      const groupItem = document.createElement("div");
      groupItem.className = "group-item";
      groupItem.innerText = group.name;
      groupItem.addEventListener("click", () => this.selectGroup(group.id));
      groupList.appendChild(groupItem);
    });
  }

  // Select a group and load messages
  async selectGroup(groupId) {
    this.selectedGroupId = groupId;
    const messages = await this.messageHandler.fetchMessages(groupId);
    this.renderMessages(messages);
  }

  // Render messages in the chat
  renderMessages(messages) {
    const { messageList } = this.cachedElements;
    messageList.innerHTML = "";

    messages.forEach((message) => {
      const messageItem = document.createElement("div");
      messageItem.className = "message-item";
      messageItem.innerHTML = `<strong>${sanitizeHTML(
        message.sender
      )}</strong>: ${sanitizeHTML(message.text)}`;
      messageList.appendChild(messageItem);
    });
  }

  // Send a new message
  async sendMessage() {
    const { sendMessageInput } = this.cachedElements;
    const messageText = sendMessageInput.value.trim();

    if (!messageText || !this.selectedGroupId) return;

    try {
      await this.messageHandler.sendMessage(this.selectedGroupId, messageText);
      sendMessageInput.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  // Receive a new message via WebSocket
  receiveMessage(data) {
    if (data.groupId === this.selectedGroupId) {
      this.renderMessages([data]);
    }
  }

  // Logout user
  logout(userKey) {
    localStorage.removeItem(userKey);
    window.location.href = "index.html";
  }
}

export default ChatApp;

