
import { debounce, sanitizeHTML, fetchData } from "./Utilities.js";


document.addEventListener("DOMContentLoaded", () => {
  const SERVER_URL = "http://3.6.134.76:3000" || "http://localhost:3000";
  const chat = new Chat(SERVER_URL);

  const loggedInuserId = chat.getQueryParam("userId");
  const socketId = chat.getQueryParam("socketId");

  if (!loggedInuserId || !socketId) {
    chat.logout();
    return;
  }

  const socket = io(SERVER_URL, { query: { loggedInuserId, socketId } });

  chat.initializeSocket(socket);
  chat.loadGroups(loggedInuserId);
  chat.setupEventListeners(loggedInuserId, socket);
});

// Utilities.js
export const debounce = (func, delay, immediate = false) => {
  let timer;
  return (...args) => {
    const callNow = immediate && !timer;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) func(...args);
    }, delay);
    if (callNow) func(...args);
  };
};

export const sanitizeHTML = (str) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, "text/html");
  return doc.body.textContent || "";
};

export const fetchData = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
};

// Chat.js
export default class Chat {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.groups = [];
    this.messages = [];
  }

  getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  logout() {
    alert("Invalid session. Please log in again.");
    window.location.href = "login.html";
  }

  async loadGroups(userId) {
    try {
      const data = await fetchData(`${this.serverUrl}/chatapp/groups/${userId}/groups`);
      this.groups = data;
      this.renderGroups();
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  }

  renderGroups() {
    const groupList = document.querySelector(".group-list");
    groupList.innerHTML = "";
    this.groups.forEach((group) => {
      const listItem = document.createElement("li");
      listItem.className = "group-item";
      listItem.dataset.id = group.id;
      listItem.innerHTML = `<i class="fa-solid fa-user-group"></i> ${group.groupname}`;
      groupList.appendChild(listItem);
    });
  }

  initializeSocket(socket) {
    socket.on("newMessage", (message) => {
      this.handleNewMessage(message);
    });
  }

  handleNewMessage(message) {
    console.log("New message received:", message);
    // Handle the new message logic
  }

  setupEventListeners(userId, socket) {
    document.getElementById("logout").addEventListener("click", () => this.logout());

    const chatMessages = document.querySelector(".chat-messages");
    chatMessages.addEventListener(
      "scroll",
      debounce(async () => {
        if (chatMessages.scrollTop === 0) {
          await this.fetchOlderMessages(userId);
        }
      }, 300)
    );
  }

  async fetchOlderMessages(userId) {
    console.log("Fetching older messages for user:", userId);
    // Implement older message fetching logic
  }
}
