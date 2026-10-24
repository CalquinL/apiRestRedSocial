import { Router } from "express";
import PublicationController from "../controllers/publication";
import { auth } from "../middlewares/auth";
import { roles } from "../middlewares/roles";
import multer from "multer";

const router = Router();

// Configuración de Multer para Imágenes de Publicaciones
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications/");
    },
    filename: (req, file, cb) => {
        cb(null, `pub-${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("UNSUPPORTED_MEDIA_TYPE"), false);
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Rutas de Publicaciones
router.post("/", auth, roles(["beneficiario"]), PublicationController.create);
router.get("/", auth, PublicationController.listApproved);
router.get("/:id", auth, PublicationController.getById);
router.patch("/:id", auth, PublicationController.update);
router.delete("/:id", auth, PublicationController.remove);
router.patch("/:id/status", auth, roles(["admin"]), PublicationController.moderate);
router.put("/:id/image", auth, upload.single("file"), PublicationController.uploadImage);

// Rutas de Usuario relacionadas con publicaciones
router.get("/users/:id/publications", auth, PublicationController.listByUser);

export default router;
