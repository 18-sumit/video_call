import { getIO } from "../sockets.js";

export const handleChatMessages = (socket, ioInstance) => {

    socket.on(
        "chat-message",
        async ({ roomId, message, sender }) => {
            try {

                const newMsg = await Chat.create({
                    roomId, message, sender
                });

                const populatedMsg = await newMsg.populate("sender", "name email");
                getIO().to(roomId).emit("new-message", populatedMsg);
            } catch (error) {
                console.error("chat-error:", error.message)
            }
        });
}