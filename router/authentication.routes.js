import { Router } from "express";
import authenticationController from "../controllers/authentication.controller.js";

const authenticationRouter = Router();

authenticationRouter.post('/create-new-user',authenticationController.createUser);

export default authenticationRouter;