import GroupService from "../services/GroupService.js";


class GroupsController{

constructor(){

    //function to create Groups
    this.createGroup=async(req,res)=>{
        try {
        const {groupname, createdBy} = req.body;
            const newgroup = await GroupService.createNewGroup(groupname,createdBy);
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
}

}
export default new GroupsController();