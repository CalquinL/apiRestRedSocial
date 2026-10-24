import { Router } from "express";
import UserController from "../controllers/user";
import { auth } from "../middlewares/auth";

const router = Router();

// Definición de rutas
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", auth, UserController.profile);
router.get("/list", auth, UserController.list);
router.get("/list/:page", auth, UserController.list);
router.put("/update", auth, UserController.update);
router.post("/upload", UserController.upload); // Multer se configurará en app.ts o mediante un middleware separado
router.get("/avatar/:file", UserController.avatar);

export default router;
