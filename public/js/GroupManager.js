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
   
    return participants;
    }
    
    async createNewGroup(groupname,loggedInuserId,grouptemporaryParticipants){
        try {
            const response = await fetch(`${this.apiBaseUrl}/chatapp/groups/`, {
              method: "POST",
              headers: {
                "Content-type": "application/json",
              },
              body: JSON.stringify({
                groupName: groupname,
                createdBy: loggedInuserId,
                groupparticipantsList:grouptemporaryParticipants,
              }),
            });
          const result = await response.json();
          return result;
          } catch (error) {
            console.error(error);
          }
    }
}

export default GroupManager;
