import { Router } from "express";


const router = Router();

router.post('/register', registeredUser);
router.post('/login', loginUser)