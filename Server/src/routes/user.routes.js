import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";

const UserRouter = Router();

// router.post('/register').post(registeredUser);
// router.post('/login', loginUser)

UserRouter.route("/register").post(registerUser);
UserRouter.route("/login").post(loginUser);










export default UserRouter;