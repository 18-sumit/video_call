import { Server } from "socket.io";

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
        console.log(`client connected : ${socket.id}`);

        // Listen for join room
        socket.on("join-room", (roomId, userId) => {
            socket.join(roomId);
            socket.to(roomId).emit("user-connected", userId);
        })

        //Listen for call events
        socket.on("call-user", ({ to, signalData }) => {
            ioInstance.to(to).emit("incoming-call", { signal: signalData, from: socket.id });
        })

        // Listen for errors
        socket.on("error", (err) => {
            console.error(`Error in socket connection: ${err}`);
        });

        // Client disconnect hone par yeh block execute hoga.
        socket.on("disconnect", () => {
            console.log(`client disconnected : ${socket.id}`);
        });
    })

    console.log("✅ WebSockets initialized successfully"); // Yeh log print hota hai jab WebSocket server initialize ho jata hai.
};

// `getIO` function, jo `ioInstance` ko access karne ke liye use hota hai.
// Agar `ioInstance` initialize nahi hua hai, toh error throw karega.

export const getIO = () => {
    if (!ioInstance) {
        throw new Error("❌ Socket.io instance is not initialized. Make sure to call initializeSockets first.");
    }

    return ioInstance;  // Agar `ioInstance` initialized hai, toh usko return karega.
};