import { Router } from "express";
import UserController from "../controllers/user";
import { auth } from "../middlewares/auth";
import { uploadMiddleware } from "../middlewares/upload";

const router = Router();

// Definición de rutas
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", auth, UserController.profile);
router.get("/list", auth, UserController.list);
router.get("/list/:page", auth, UserController.list);
router.patch("/update", auth, UserController.update);
router.post("/upload", auth, uploadMiddleware, UserController.upload);
router.get("/avatar/:file", UserController.avatar);

export default router;
