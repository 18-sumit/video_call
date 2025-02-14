import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { Server } from "socket.io";



const app = express();


app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)

app.use(
    express.json({
        limit: "16kb"
    })
)

app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb"
    })
)

app.use(cookieParser())

// routes import :
import UserRouter from "./routes/user.routes.js";
import logger from "./logger.js";
app.use("/api/v1/user", UserRouter)




export default app;