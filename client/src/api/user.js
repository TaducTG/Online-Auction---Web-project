import axios from "axios";
const VITE_API = import.meta.env.VITE_API;

export const changePassword = async (formData) => {
    try {
        const res = await axios.patch(`${VITE_API}/user`,
            formData,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't update password")
        throw error;
    }
}

export const updateProfile = async (formData) => {
    try {
        const res = await axios.put(`${VITE_API}/user/profile`,
            formData,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't update profile")
        throw error;
    }
}

export const loginHistory = async () => {
    try {
        const res = await axios.get(`${VITE_API}/user/logins`,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't show login history")
        throw error;
    }
}

export const getUser = async () => {
    try {
        const res = await axios.get(`${VITE_API}/user`,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't fetch user")
        throw error;
    }
}

export const topUpBalance = async (data) => {
    try {
        const res = await axios.post(`${VITE_API}/user/topup`,
            data,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't top-up balance")
        throw error;
    }
}