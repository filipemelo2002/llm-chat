import multer from "multer";

export const store = multer.memoryStorage();

const multerInstance = multer({ storage: store });
export const uploadFileMiddleware = multerInstance.single("file");
