import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getAllMessages, sendMessage, deleteMessageForSelf } from "../controllers/chat.controller.js";

const chatRouter = Router();

chatRouter.post("/sendmessage", verifyJWT, sendMessage);
chatRouter.get("/:roomId", verifyJWT, getAllMessages);
chatRouter.delete("/:messageId", verifyJWT, deleteMessageForSelf)


export default chatRouter;