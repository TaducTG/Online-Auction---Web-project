import express from 'express';
import { handleGetUser, handleChangePassword, getLoginHistory, handleUpdateProfile } from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.get('/', handleGetUser);
userRouter.patch("/", handleChangePassword);
userRouter.put("/profile", handleUpdateProfile);
userRouter.get("/logins", getLoginHistory)

export default userRouter;