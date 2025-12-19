import Notification from "../models/notification.js";
import { connectDB } from '../connection.js';

export const getNotifications = async (req, res) => {
    try {
        await connectDB();
        const userId = req.user.id;

        const notifications = await Notification.find({ recipient: userId })
            .populate('actor', 'name avatar')
            .populate('auction', 'itemName itemPhoto')
            .sort({ createdAt: -1 });

        // Count unread notifications
        const unreadCount = await Notification.countDocuments({ 
            recipient: userId, 
            isRead: false 
        });

        res.status(200).json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

export const markAsRead = async (req, res) => {
    try {
        await connectDB();
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.status(200).json({
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: "Failed to mark notification as read" });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await connectDB();
        const userId = req.user.id;

        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        await connectDB();
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndDelete(notificationId);

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ error: "Failed to delete notification" });
    }
};

export const deleteAllNotifications = async (req, res) => {
    try {
        await connectDB();
        const userId = req.user.id;

        await Notification.deleteMany({ recipient: userId });

        res.status(200).json({ message: "All notifications deleted successfully" });
    } catch (error) {
        console.error("Error deleting all notifications:", error);
        res.status(500).json({ error: "Failed to delete all notifications" });
    }
};

// Helper function to create notification
export const createNotification = async (recipientId, type, auctionId, actorId, title, message) => {
    try {
        const notification = new Notification({
            recipient: recipientId,
            type,
            auction: auctionId,
            actor: actorId,
            title,
            message
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};
