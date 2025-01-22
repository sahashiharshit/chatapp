
import { Op } from "sequelize";
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

  async getMessagesAccordingtoTimestamp(groupId, userId,timestamp) {
    try {
      if (!groupId || !userId) {
        throw new Error("Group ID and User ID are required.");
    }
      const isMember = await GroupMembers.findOne({
        where: { group_id: groupId, user_id: userId },
      });
      if (!isMember) throw new Error("User is not a member of this group");
      const whereCondition = {group_id:groupId};
      if(timestamp){
        whereCondition.createdAt = {}; 
       whereCondition.createdAt[Op.lt] = new Date(timestamp);
      }
     // console.log(whereCondition);
      const messages = await Chats.findAll({
        where: whereCondition,
        include: [
          { model: User, as: "sender", attributes: ["name"] },
          { model: Groups, attributes: ["groupname"] },
        ],
        order: [["createdAt", "ASC"]], // Sort messages by creation time
        
        
      });
      return messages;
      
      
    } catch (error) {
      throw new Error(
        "Failed to find data in database! Please try again later"
      );
    }
  }
  async getAllMessages(groupId, userId){
  try {
    if (!groupId || !userId) {
      throw new Error("Group ID and User ID are required.");
  }
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
