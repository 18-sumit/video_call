import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";



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
import RoomRouter from "./routes/room.routes.js";
import callRouter from "./routes/call.routes.js";

app.use("/api/v1/user", UserRouter);
app.use("/api/v1/rooms", RoomRouter);
app.use("/api/v1/call", callRouter);



export default app;