import { Router } from "express";
import { initiateCall , endCall } from "../controllers/call.controller.js";


const callRouter = Router();

callRouter.post("/start", initiateCall);
callRouter.post("endcall" ,endCall );


export default callRouter;
