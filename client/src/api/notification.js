import axios from "axios";
const VITE_API = import.meta.env.VITE_API;

export const getNotifications = async () => {
    try {
        const res = await axios.get(`${VITE_API}/notifications`, {
            withCredentials: true
        });
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Failed to fetch notifications");
        throw error;
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        const res = await axios.patch(
            `${VITE_API}/notifications/${notificationId}/read`,
            {},
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Failed to mark notification as read");
        throw error;
    }
};

export const markAllNotificationsAsRead = async () => {
    try {
        const res = await axios.patch(
            `${VITE_API}/notifications/read-all`,
            {},
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Failed to mark all notifications as read");
        throw error;
    }
};

export const deleteNotification = async (notificationId) => {
    try {
        const res = await axios.delete(
            `${VITE_API}/notifications/${notificationId}`,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Failed to delete notification");
        throw error;
    }
};

export const deleteAllNotifications = async () => {
    try {
        const res = await axios.delete(
            `${VITE_API}/notifications`,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Failed to delete all notifications");
        throw error;
    }
};
