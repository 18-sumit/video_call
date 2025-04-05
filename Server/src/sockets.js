import { Server } from "socket.io";
import { handleOffer, handleAnswer, handleICECandidate } from "./controllers/call.controller.js";

let ioInstance = null;


export const initializeSockets = (server) => {
    ioInstance = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });


    // Jab bhi client WebSocket se connect karega, yeh block execute hoga.
    ioInstance.on("connection", (socket) => {
        console.log(` client connected : ${socket.id}`);

        // Listen for user => join a room
        socket.on("join-room", async (roomId, userId) => {
            socket.join(roomId);
            console.log(`User: ${userId} joined room: ${roomId}`);

            //DB Update: Add user to participants
            await Call.findOneAndUpdate(
                { roomId },
                { $addToSet: { participants: userId } }, // $addToSet ensures no duplicate users
                { upsert: true, new: true }
            );

            socket.to(roomId).emit("new-participant-connected", userId);
        });


        socket.on("leave-room", async (roomId, userId) => {
            socket.leave(roomId);
            console.log(`User: ${userId} left room: ${roomId}`);

            //DB Update: Remove user from participants
            const updatedCall = await Call.findOneAndUpdate(
                { roomId },
                { $pull: { participants: userId } },
                { new: true }
            );

            //notify-other participants
            socket.to(roomId).emit("participant-left", userId);

            if (updatedCall.participants.length === 0) {
                await Call.findOneAndUpdate({ roomId }, { isActive: false });
                console.log(`Call ended for room: ${roomId}`);
            };
        });


        // Handling WebRTC Signaling
        handleOffer(socket);
        handleAnswer(socket);
        handleICECandidate(socket);

        // Listen for errors
        socket.on("error", (err) => {
            console.error(`Error in socket connection: ${err}`);
        });

        // Client disconnect hone par yeh block execute hoga.
        socket.on("disconnect", () => {
            console.log(`client disconnected : ${socket.id}`);
        });
    })

    console.log(" WebSockets initialized successfully "); // Yeh log print hota hai jab WebSocket server initialize ho jata hai.
};

// `getIO` function, jo `ioInstance` ko access karne ke liye use hota hai.
// Agar `ioInstance` initialize nahi hua hai, toh error throw karega.

export const getIO = () => {
    if (!ioInstance) {
        throw new Error("❌ Socket.io instance is not initialized. Make sure to call initializeSockets first.");
    }

    return ioInstance;  // Agar `ioInstance` initialized hai, toh usko return karega.
};