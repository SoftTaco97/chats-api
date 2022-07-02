import { Router } from "express";
import { ChatsController } from '../controllers';

const router = Router();

router.post('/', ChatsController.addChatMessage);

router.get('/', ChatsController.getChats);

export default router;
