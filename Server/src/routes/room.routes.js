import { Router } from "express";
import { createRoom, getAllRooms, leaveRoom, getRoomById, joinRoom, deleteRoom } from "../controllers/room.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { checkRoomAdmin } from "../middleware/admin.middleware.js";


const RoomRouter = Router();


RoomRouter.post("/", verifyJWT, createRoom);
RoomRouter.get("/", getAllRooms);
RoomRouter.get("/:roomId", getRoomById)
RoomRouter.post("/:roomId/join", verifyJWT, joinRoom);
RoomRouter.post("/:roomId/leave", verifyJWT, leaveRoom);

//ONLY OWNER OF THE ROOM
RoomRouter.delete("/:roomId", verifyJWT, checkRoomAdmin, deleteRoom)



export default RoomRouter;