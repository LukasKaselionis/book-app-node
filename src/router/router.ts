import express, { Router, Request, Response } from "express";
import { JWTMiddleware } from "../middleware/jwt";
import uploadMiddleware from "../middleware/upload";
import AuthController from "../controllers/AuthController";
import BookController from "../controllers/BookController";

const router: Router = express.Router();
const authController: AuthController = new AuthController();
const bookController: BookController = new BookController();

router.post("/login", (req: Request, res: Response) => authController.login(req, res));
router.post("/register", (req: Request, res: Response) => authController.register(req, res));
router.put("/set-new-password/:id", (req: Request, res: Response) => authController.setNewPassword(req, res));
router.post("/forgot-password", (req: Request, res: Response) => authController.forgotPassword(req, res));

// Authorization routes
router.get("/book", JWTMiddleware, (req: Request, res: Response) => bookController.list(req, res));
router.post("/book", [
    JWTMiddleware,
    uploadMiddleware.fields([{ name: "imagePath" }, { name: "filePath" }])
], (req: Request, res: Response) => bookController.create(req, res));
router.patch("/book", [
    JWTMiddleware,
    uploadMiddleware.fields([{ name: "imagePath" }, { name: "filePath" }])
], (req: Request, res: Response) => bookController.update(req, res));
router.delete("/book", JWTMiddleware, (req: Request, res: Response) => bookController.delete(req, res));

export default router;
