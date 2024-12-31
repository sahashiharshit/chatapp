import {GroupMembers,Groups,User} from '../config/association.js';

class GroupService{

    async getGroups(userId){
        try {
       const result = await Groups.findAll({
            include:[
            // {
            // model:User,
            // as:"creator",
            // where:{id:userId},
            // required:false,
            // },
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
        
        async createNewGroup(groupname,createdBy){
        
        try {
            const result = await Groups.create({groupname,created_by:createdBy});
            await GroupMembers.create({group_id:result.id,user_id:createdBy});
            return result;
        } catch (error) {
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

}
export default new GroupService();