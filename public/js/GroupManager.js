// GroupManager.js
import { fetchData } from "./Utilities.js";

class GroupManager {
    constructor(apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl;
        
    }

    async fetchGroups(userId) {
        try {
            return await fetchData(`${this.apiBaseUrl}/chatapp/groups/${userId}/groups`);
            
        } catch (error) {
            console.error("Error fetching groups:", error);
            
        }
    }
    async fetchParticipants(query, userId){
    const response=await fetch(`${this.apiBaseUrl}/chatapp/groups/search-participants?query=${encodeURIComponent(query)}&userId=${encodeURIComponent(userId)}`);
    const participants = await response.json();
    console.log('Participants:',participants);
    return participants;
    }
}

export default GroupManager;
