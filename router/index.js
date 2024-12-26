import { Router } from "express";
import authenticationRouter from "./authentication.routes.js";
import chatsRouter from "./chats.routes.js";

const routes = Router();

routes.use('/auth',authenticationRouter);
routes.use('/',authenticationRouter);
routes.use('/post',chatsRouter);
export default routes;
