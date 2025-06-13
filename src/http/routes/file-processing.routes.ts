import { Router } from "express";
import { uploadFileMiddleware } from "../middlewares/filte-upload.middleware";
import { FilesProcessingController } from "../controllers/files-processing.controller";

const filesProcessingController = new FilesProcessingController();
const router = Router();

router.post(
  "/upload",
  uploadFileMiddleware,
  filesProcessingController.processFile.bind(filesProcessingController)
);

export default router;
