import { Router } from "express";
import groupsController from "../controllers/groups.controller.js";

const groupsRouter = Router();

groupsRouter.post('/',groupsController.createGroup);
groupsRouter.post('/:groupId/members',groupsController.addMemberToGroup);
groupsRouter.get('/:userId/groups',groupsController.getGroups);
groupsRouter.get('/search-participants',groupsController.searchUser);
export default groupsRouter;