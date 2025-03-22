import { Router } from "express";
import { initiateCall, endCall, getCallHistory, handleAnswer, handleOffer, handleICECandidate } from "../controllers/call.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const callRouter = Router();

callRouter.post("/start", verifyJWT, initiateCall);
callRouter.post("/endcall", verifyJWT, endCall);
callRouter.get("history/:userId", verifyJWT, getCallHistory)


export default callRouter;
