import { Router } from "express";
import { errorHandler } from "../middleware";
import chatRoutes from './chats';

const router = Router();

router.use('/chats', chatRoutes);

router.use(errorHandler);

export default router;
