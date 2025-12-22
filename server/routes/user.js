import express from 'express';
import { handleGetUser, handleChangePassword, getLoginHistory, handleUpdateProfile, handleTopUp } from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.get('/', handleGetUser);
userRouter.patch("/", handleChangePassword);
userRouter.put("/profile", handleUpdateProfile);
userRouter.get("/logins", getLoginHistory)
userRouter.post("/topup", handleTopUp);

export default userRouter;