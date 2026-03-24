import express from "express";
import { sendContactMessage, getContactMessages } from "../controller/contact.controller.js";
import { authenticateToken } from "../middlewares/auth.js";

const contactRouter = express.Router();


contactRouter.post("/p/:slug", sendContactMessage);


contactRouter.get("/", authenticateToken, getContactMessages);

export default contactRouter;
