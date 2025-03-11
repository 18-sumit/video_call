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
        console.log(`✅ client connected : ${socket.id}`);

        // Listen for join room
        socket.on("join-room", (roomId, userId) => {
            socket.join(roomId);
            console.log(`User ${userId} joined room ${roomId}`);
            socket.to(roomId).emit("user-connected", userId);
        })

        // Handling WebRTC Signaling
        socket.on("offer", ({ roomId, offer }) => {
            socket.to(roomId).emit("offer", offer);
        });

        socket.on("answer", ({ roomId, answer }) => {
            socket.to(roomId).emit("answer", answer)
        });

        socket.on("ice-candidate", ({ roomId, candidate }) => {
            socket.to(roomId).emit("ice-candidate", candidate)
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