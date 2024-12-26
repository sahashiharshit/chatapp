import { Router } from "express";
import authenticationController from "../controllers/authentication.controller.js";
import { isAuthenticated } from "../middleware/authenticate.js";

const authenticationRouter = Router();

authenticationRouter.post('/create-new-user',authenticationController.createUser);
authenticationRouter.post('/login',authenticationController.login);
authenticationRouter.get('/users',authenticationController.getUsers);
authenticationRouter.get('/check-session',authenticationController.checkSession);
export default authenticationRouter;