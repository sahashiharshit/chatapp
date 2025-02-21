import { Router } from "express";
import groupsController from "../controllers/groups.controller.js";

const groupsRouter = Router();

groupsRouter.post('/',groupsController.createGroup);
groupsRouter.post('/:groupId/members',groupsController.addMemberToGroup);
groupsRouter.get('/:userId/groups',groupsController.getGroups);
groupsRouter.get('/groupname/:groupId',groupsController.getGroupById);
groupsRouter.get('/search-participants',groupsController.searchUser);
groupsRouter.get('/getUsers/:group_id/:loggedInUserId',groupsController.getUsersByGroupName);
groupsRouter.post('/removeUser',groupsController.removeUser);
groupsRouter.post('/makeUserAdmin',groupsController.makeUserAdmin);
export default groupsRouter;