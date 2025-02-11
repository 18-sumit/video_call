import { Router } from "express";
import { registeredUser, loginUser } from "../controllers/user.controller.js";

const UserRouter = Router();

// router.post('/register').post(registeredUser);
// router.post('/login', loginUser)

UserRouter.post('/register', registeredUser)

export default UserRouter;