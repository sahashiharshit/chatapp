import { fetchData } from "./Utilities.js";
class MessageHandler {
  constructor(apiBaseUrl, socket) {
    this.apiBaseUrl = apiBaseUrl;
    this.socket = socket;
  }

  async fetchMessages(groupId, userId) {
    try {
      const [messages, groupname] = await Promise.all([
        fetchData(
          `${this.apiBaseUrl}/chatapp/chat/messages?groupId=${groupId}&userId=${userId}`
        ),
        fetchData(`${this.apiBaseUrl}/chatapp/groups/groupname/${groupId}`),
      ]);
      if (!messages || !groupname)
        throw new Error("Failed to fetch messages or group name.");

    //   console.log("Messages:", messages);
    //   console.log("Group Name:", groupname);

      return { groupname, messages };
    } catch (error) {
      console.error("Error fetching messages:", error);
        return { groupname: null, messages: [] };
    }
  }

  async sendMessage(groupId, userId, message) {
    try {
      if (!message) return;
      this.socket.emit("sendMessage", { groupId, userId, message });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
}
export default MessageHandler;
