import { Router } from "express";
import authenticationRouter from "./authentication.routes.js";
import chatsRouter from "./chats.routes.js";
import groupsRouter from "./groups.routes.js";

const routes = Router();

routes.use('/auth',authenticationRouter);

routes.use('/chat',chatsRouter);

routes.use('/groups',groupsRouter);

export default routes;
