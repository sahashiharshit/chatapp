import GroupService from "../services/GroupService.js";
import UserService from "../services/UserService.js";


class GroupsController{

constructor(){

    //function to create Groups
    this.createGroup=async(req,res)=>{
        
        try {
        const {groupName, createdBy,groupparticipantsList} = req.body;
            const newgroup = await GroupService.createNewGroup(groupName,createdBy,groupparticipantsList);
            const io = req.app.get("socketio");
            io.emit("groupCreated",{groupId:newgroup.id,groupName,members:[createdBy,...groupparticipantsList]});
            res.status(201).json({message:"Group created Succefully",newgroup});
            
        } catch (error) {
            res.status(500).json({error: "Failed to create group", details: error.message})
        }
        
    
    }
    //function to add members to group
    this.addMemberToGroup =async (req,res)=>{
    try {
        const {groupId} = req.params;
        const {userId} = req.body;
        const newMember = await GroupService.addMemberToGroup(groupId,userId);
        res.status(201).json({message:"Member Added Successfully",newMember});
    } catch (error) {
        res.status(500).json({error});
    }
    
    }
    this.getGroupById=async(req,res)=>{
        try{
            const {groupId}=req.params;
            const groupname = await GroupService.getGroupName(groupId);
            res.status(200).json(groupname);
        }catch(error){
            console.error("Error fetching group:", error.message);
            res.status(404).json({error:error.message});
        }
    }
    //function to get groups
    this.getGroups=async(req,res)=>{
    
        try{
        const {userId} = req.params;
        
        const groups = await GroupService.getGroups(userId);
        res.status(200).json(groups);
        }catch(error){
            res.status(500).json({ error: "Failed to retrieve groups", details: error.message });
        
        }
    }


    this.searchUser= async(req,res)=>{
        const {query,userId} = req.query;
        try {
            const users = await UserService.getUserByQuery(query,userId);
            console.log("users are:",users);
            res.status(201).json(users);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch participants' });
        }
    
    }
    this.getUsersByGroupName = async(req,res)=>{
    
    const {group_id,loggedInUserId} = req.params;
    try {
        const users = await GroupService.getGroupUser(group_id);
        const loggedInUser = users.members.find((member)=>member.id===loggedInUserId);
        const isAdmin = loggedInUser?loggedInUser.GroupMembers.isAdmin:false;
        
        res.status(203).json({ members : users.members.map((member)=>({
            userId:member.id,   
            userName:member.name,
            isAdmin:member.GroupMembers.isAdmin,
          })),isLoggedInUserAdmin:isAdmin,});
    } catch (error) {
        res.status(404).json({error:'Faild to find Users'});
    }
    
    }
    this.removeUser=async(req,res)=>{
    const {group_id,user_id}= req.body;
    try {
        const removeUser = await GroupService.removeUser(group_id,user_id);
        res.status(200).json(removeUser);
    } catch (error) {
        res.status(500).json(error);
    }
    }
    
    this.makeUserAdmin = async(req,res)=>{
        const {group_id,user_id}= req.body;
        try {
            const updateStatus = await GroupService.updateUserStatus(group_id,user_id);
            res.status(200).json(updateStatus);
        } catch (error) {
            res.status(500).json(error);
        }
    }

}



}
export default new GroupsController();