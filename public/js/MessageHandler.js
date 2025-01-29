import { fetchData } from "./Utilities.js";
class MessageHandler{
constructor(apiBaseUrl,socket){
this.apiBaseUrl= apiBaseUrl;
this.socket= socket;

}

async fetchMessages(groupId,userId){
    try{
        const messages= await fetchData(`${this.apiBaseUrl}/chatapp/chat/messages?groupId=${groupId}&userId=${userId}`);
        const groupname= await fetchData(`${this.apiBaseUrl}/chatapp/groups/groupname/${groupId}`);
        console.log(groupname);
        return [groupname,messages];
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