import { Chats } from "../models/Chats.js";
import { GroupMembers } from "../models/GroupMembers.js";
import { Groups } from "../models/Groups.js";
import { User } from "../models/User.js";

Groups.belongsTo(User,{foreignKey:'created_by',as:"creator"});
User.hasMany(Groups,{foreignKey:'created_by',as:"createdGroups"});

Groups.belongsToMany(User,{through:GroupMembers,foreignKey:"group_id", as: "members"});
User.belongsToMany(Groups,{through:GroupMembers,foreignKey: "user_id", as: "groups"});


Groups.hasMany(Chats,{foreignKey: "group_id", as: "messages"});
Chats.belongsTo(Groups,{ foreignKey: "group_id" });

User.hasMany(Chats,{ foreignKey: "user_id", as: "sentMessages" });
Chats.belongsTo(User,{foreignKey: "user_id", as: "sender" });

export {User,Groups,GroupMembers,Chats};