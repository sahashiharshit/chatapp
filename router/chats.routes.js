import  { Router } from "express";
import { isAuthenticated } from "../middleware/authenticate.js";
import chatstoreController from "../controllers/chatstore.controller.js";

const chatsRouter = Router();

chatsRouter.post('/chat',isAuthenticated,chatstoreController.storechat);
export default chatsRouter;