// GroupManager.js
import { fetchData } from "./Utilities.js";

class GroupManager {
    constructor(apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl;
        
    }

    async fetchGroups(userId) {
        try {
            return await fetchData(`${this.apiBaseUrl}/chatapp/groups/${userId}/groups`, {
                
            });
        } catch (error) {
            console.error("Error fetching groups:", error);
            return [];
        }
    }
}

export default GroupManager;
