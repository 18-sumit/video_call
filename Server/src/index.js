import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import logger from "./logger.js";
import { createServer } from "http";
import { initializeSockets } from "./sockets.js"; // setup of websocket

dotenv.config({
    path: "/.env"
})


const PORT = process.env.PORT || 8000;

// Create HTTP server (Required for WebSockets)
const server = createServer(app);




try {
    await connectDB();

    // Initialize WebSockets (Pass server)
    initializeSockets(server);

    server.listen(PORT, () => {
        logger.info(`Server is running on PORT : ${PORT}`)
    });

} catch (error) {
    logger.error(`MONGODB connection failed  : ${error.message}`);
}