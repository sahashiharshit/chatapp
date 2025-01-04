import {GroupMembers,Groups,User} from '../config/association.js';
import { dbconnection } from '../config/database.js';

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
        //For creating new Group and creating members in bulk to group members table
        async createNewGroup(groupname,createdBy,groupparticipantsList){
          const t = await dbconnection.transaction();
        try {
        
            const group = await Groups.create({groupname,created_by:createdBy},{transaction:t});
            const allParticipants = [...groupparticipantsList,createdBy];
            const groupMembers = allParticipants.map(userId=>({
            
            group_id:group.id,
            user_id:userId
            }));
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

}
export default new GroupService();