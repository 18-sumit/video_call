import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const UserRouter = Router();

// router.post('/register').post(registeredUser);
// router.post('/login', loginUser)

UserRouter.route("/register").post(registerUser);
UserRouter.route("/login").post(loginUser);


// secured | Protected routes:
UserRouter.route("/logout").post(verifyJWT, logoutUser)










export default UserRouter;