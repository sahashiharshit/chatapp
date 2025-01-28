import { fetchData } from "./Utilities.js";
class MessageHandler{
constructor(apiBaseUrl,socket){
this.apiBaseUrl= apiBaseUrl;
this.socket= socket;

}

async fetchMessages(groupId,userId){
    try{
        return await fetchData(`${this.apiBaseUrl}/chatapp/chat/messages?groupId=${groupId}&userId=${userId}`);
         
    }catch(error){
        console.error("Error fetching messages:",error);
    }
}

async sendMessage(groupId,userId, message) {
    try {
        if(!message) return;
        this.socket.emit("sendMessage",{groupId,userId,message});
    } catch (error) {
        console.error("Error sending message:", error);
    }
}
}
export default MessageHandler;