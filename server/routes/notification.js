import express from 'express';
import { 
    getNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    deleteAllNotifications 
} from '../controllers/notification.controller.js';

const notificationRouter = express.Router();

notificationRouter.get('/', getNotifications);
notificationRouter.patch('/:notificationId/read', markAsRead);
notificationRouter.patch('/read-all', markAllAsRead);
notificationRouter.delete('/:notificationId', deleteNotification);
notificationRouter.delete('/', deleteAllNotifications);

export default notificationRouter;
