import express from "express";
import { checkAdmin } from "../middleware/checkAdmin.js";
import { getAdminDashboard, getAllUsers, deleteUser, updateUser, getAllAuctions, endAuctionManually } from "../controllers/admin.controller.js";
const adminRouter = express.Router();

adminRouter.get('/dashboard', checkAdmin, getAdminDashboard);
adminRouter.get('/users', checkAdmin, getAllUsers);
adminRouter.put('/users/:id', checkAdmin, updateUser);
adminRouter.delete('/users/:id', checkAdmin, deleteUser);
adminRouter.get('/auctions', checkAdmin, getAllAuctions);
adminRouter.put('/auctions/:id/end', checkAdmin, endAuctionManually);

export default adminRouter;