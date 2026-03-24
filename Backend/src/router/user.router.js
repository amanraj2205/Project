import {Router} from "express";
import { registerUser, login, logout, getCurrentUser, getAllUsers } from "../controller/user.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", getCurrentUser);
router.get("/all", getAllUsers);


export default router;