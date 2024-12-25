import { Router } from "express";
import authenticationRouter from "./authentication.routes.js";

const routes = Router();

routes.use('/auth',authenticationRouter)
export default routes;
