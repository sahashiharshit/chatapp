import  { Router } from "express";

import chatstoreController from "../controllers/chatstore.controller.js";

const chatsRouter = Router();

chatsRouter.post('/sendmessage',chatstoreController.storechat);
chatsRouter.get('/messages',chatstoreController.getMessages);
export default chatsRouter;