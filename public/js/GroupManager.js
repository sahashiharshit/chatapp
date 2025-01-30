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
    
    async getUserlist(group_id,loggedInUserId){
    try {
      return await fetchData(`${this.apiBaseUrl}/chatapp/groups/getUsers/${group_id}/${loggedInUserId}`);
      
    } catch (error) {
      console.log(error);
    }
    }
    
    async makeUserAdmin(group_id,user_id){
    try {
      return await fetchData(`${this.apiBaseUrl}/chatapp/groups/makeUserAdmin`,
      {
        method:"POST",
        headers:{"Content-Type":"application/json",
        },
        body:JSON.stringify({group_id,user_id}),
      }
      );
    } catch (error) {
      console.error(error);
    }
    }
    
    async removeMember(group_id, user_id) {
      //code to remove user from current group
      try {
        return await fetchData(
          `${this.apiBaseUrl}/chatapp/groups/removeUser`,
          {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({
              group_id,
              user_id,
            }),
          }
        );
      } catch (error) {
        console.log(error);
      }
    }
}

export default GroupManager;
