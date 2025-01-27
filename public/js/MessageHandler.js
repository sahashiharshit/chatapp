import { fetchData } from "./Utilities.js";
class MessageHandler{
constructor(apiBaseUrl,token){
this.apiBaseUrl= apiBaseUrl;
this.token = token;
}

async fetchMessages(groupId){
    try{
        return await fetchData(`${this.apiBaseUrl}/groups/${groupId}/messages`,{
            headers:{Authorization:`Bearer ${this.token}`},   
        });
    
    }catch(error){
        console.error("Error fetching messages:",error);
        return [];
    }
}

async sendMessage(groupId, text) {
    try {
        await fetchData(`${this.apiBaseUrl}/groups/${groupId}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.token}`,
            },
            body: JSON.stringify({ text }),
        });
    } catch (error) {
        console.error("Error sending message:", error);
    }
}
}
export default MessageHandler;