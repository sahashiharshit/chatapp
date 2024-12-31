
import { Chats } from "../models/Chats.js";
import { GroupMembers } from "../models/GroupMembers.js";
import { Groups } from "../models/Groups.js";
import { User } from "../models/User.js";

class DataService {
  async storeInDb(groupId, userId, message) {
    try {
      const isMember = await GroupMembers.findOne({
        where: { group_id: groupId, user_id: userId },
      });
      if (!isMember) throw new Error("User is not part of this group");

      const response = await Chats.create({
        group_id: groupId,
        user_id: userId,
        message: message,
      });
      return response;
    } catch (err) {
      throw new Error(
        "Failed to store data in database! Please try again later"
      );
    }
  }

  async getAllMessages(groupId, userId) {
    try {
      //     const whereCondition={};
      //     if(after){
      //     whereCondition.createdAt={[Op.gt]:new Date(after)};  // Filter messages created after the timestamp
      //     }
      //     if(before){
      //     whereCondition.createdAt={[Op.lt]:new Date(before)};
      //     }
      //     const response = await Chats.findAll({
      //     where:whereCondition,
      //     order:[['createdAt','ASC']],// Sort messages by creation time
      //     //limit:10,// Optionally, fetch only 10 messages at a time
      //     });

      const isMember = await GroupMembers.findOne({
        where: { group_id: groupId, user_id: userId },
      });
     
      if (!isMember) throw new Error("User is not a member of this group");
     
      const messages = await Chats.findAll({
        where: { group_id: groupId },
       include: [
       { model:User,as:'sender', attributes: ["name"] },
       {model:Groups,attributes:['groupname']}
       ],
        order: [["createdAt", "ASC"]],
      });
      return messages;
    } catch (error) {
      throw new Error(
        "Failed to find data in database! Please try again later"
      );
    }
  }
}
export default new DataService();
