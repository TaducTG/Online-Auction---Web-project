import Product from "../models/product.js";
import User from "../models/user.js";
// DB connection is handled at server startup in index.js

export const getAdminDashboard = async (req, res) => {
  try {
    // Get statistics
    const totalAuctions = await Product.countDocuments();
    const activeAuctions = await Product.countDocuments({
      itemEndDate: { $gt: new Date() },
    });
    const totalUsers = await User.countDocuments();
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    // Get recent active auctions for display
    const recentActiveAuctions = await Product.find({
      itemEndDate: { $gt: new Date() },
    })
      .populate("seller", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent users for display
    const recentUsersList = await User.find({})
      .select("name email role createdAt lastLogin location avatar")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      stats: {
        activeAuctions,
        totalAuctions,
        totalUsers,
        recentUsers,
      },
      recentAuctions: recentActiveAuctions,
      recentUsersList: recentUsersList,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Lỗi khi tải dữ liệu bảng điều khiển quản trị",
        error: error.message,
      });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search
      ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
      : {};

    // Get total count for pagination info
    const totalUsers = await User.countDocuments(searchQuery);

    // Get users with pagination, search, and sorting
    const users = await User.find(searchQuery)
      .select("name email role createdAt signupAt lastLogin location avatar")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          limit,
          hasNextPage,
          hasPrevPage,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải danh sách người dùng",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Không thể xóa tài khoản Admin" });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "Đã xóa người dùng thành công" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      message: "Lỗi khi xóa người dùng",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    if (address) {
      user.address = { ...user.address, ...address };
    }

    await user.save();

    res.status(200).json({ message: "Cập nhật thông tin thành công", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Lỗi khi cập nhật người dùng",
      error: error.message,
    });
  }
};
