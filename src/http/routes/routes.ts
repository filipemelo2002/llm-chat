import { Router } from "express";
import fileProcessingRouter from "./file-processing.routes";
import chatHandlingRouter from "./chat-handling.routes";
const router = Router();

router.use("/files", fileProcessingRouter);
router.use("/chat", chatHandlingRouter);
export default router;
