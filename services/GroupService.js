import {GroupMembers,Groups,User} from '../config/association.js';
import { dbconnection } from '../config/database.js';

class GroupService{

    async getGroups(userId){
        try {
       const result = await Groups.findAll({
            include:[
            
            {
                 model:User,
                 as:'members',
                 through:{where:{user_id:userId},
                 },
                 required:true,
                 
            },
            ],   
           
       });
         return result;
        } catch (error) {
          throw new Error('Error finding groups!');
        }
        
        }
        //For creating new Group and creating members in bulk to group members table
        async createNewGroup(groupname,createdBy,groupparticipantsList){
          const t = await dbconnection.transaction();
        try {
        
            const group = await Groups.create({groupname,created_by:createdBy},{transaction:t});
         
            const groupMembers = [
              {group_id:group.id,user_id:createdBy,isAdmin:true},
              ...groupparticipantsList.map(memberId=>({
              
              group_id:group.id,
              user_id:memberId,
              isAdmin:false
              })),
            ]
            
            
            await GroupMembers.bulkCreate(groupMembers,{transaction:t});
            await t.commit();
            return group;
        } catch (error) {
          await t.rollback();
            throw new Error('error in creating groups, try again later!');
        }
        
        }
        
      async addMemberToGroup(groupId,userId){
        try {
            const result = await Groups.findByPk(groupId);
            if(!result)  throw new Error('Group not found');
            
            const member = await GroupMembers.create({group_id:groupId,user_id:userId});
            return member;
        } catch (error) {
            throw new Error('Failed to add member');
        }
      }
  
  async getGroupUser(group_id){
    
    try {
        const result = await Groups.findOne(
        {
        where:{id:group_id},
        include:[
        {
          model:User,
          as:"members",
          attributes:['id','name'],
          through:{
          model:GroupMembers,
          attributes:['isAdmin'],
          },
        },
        ],
        },
        
        );
        if(!result) throw new Error('Group not Found');
        
        return result;
        
    } catch (error) {
      console.log(error);
    }
  }
  async removeUser(group_id,user_id){
  try {
    const result = await GroupMembers.destroy({
    
    where:{group_id:group_id, user_id:user_id}
    });
    if(!result) throw new Error('User not removed from group');
    return result;
  } catch (error) {
    throw new Error('Problem deleting user from group');
  }
  }
  async updateUserStatus(group_id,user_id){
    try {
      const result = await GroupMembers.update(
      {isAdmin:true},
      {
        where:{group_id:group_id,user_id:user_id},
        
      });
      return result;
    } catch (error) {
      throw new Error('Problem updating user stauts');
    }
  
  }
  async getGroupName(groupId){
    try {
      const result = await Groups.findOne({where:{id:groupId},});
      if(!result){
        throw new Error(`Group with ID ${groupId} not found`);
      }
      return result;
    } catch (error) {
      console.error("Error fetching group name:", error.message);
      throw error;
    }
  }
}
export default new GroupService();