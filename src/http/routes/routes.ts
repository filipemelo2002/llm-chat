import { Router } from "express";
import fileProcessingRouter from "./file-processing.routes";
const router = Router();

router.use("/files", fileProcessingRouter);

export default router;
