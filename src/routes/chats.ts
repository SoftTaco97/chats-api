import { Router } from "express";
import ChatsController from '../controllers/chats';

const router = Router();

router.post('/', ChatsController.addChatMessage);

router.get('/id/:id', ChatsController.getChatForId);

router.get('/user/:username', ChatsController.getChatsForUsername);

export default router;