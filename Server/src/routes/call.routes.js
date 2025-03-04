import { Router } from "express";
import { initiateCall } from "../controllers/call.controller.js";


const callRouter = Router();

callRouter.post("/start", initiateCall);



export default callRouter;
