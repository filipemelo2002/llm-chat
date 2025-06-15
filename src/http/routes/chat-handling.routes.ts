import { Router } from "express";
import { ChatHandlingController } from "../controllers/chat-handling.controller";

const chatHandlingController = new ChatHandlingController();

const router = Router();
router.get(
  "/",
  chatHandlingController.processQuestion.bind(chatHandlingController)
);

export default router;
