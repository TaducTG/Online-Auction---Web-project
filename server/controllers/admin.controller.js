import Product from "../models/product.js";
import User from "../models/user.js";
import Notification from "../models/notification.js";
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

// Get all auctions for admin
export const getAllAuctions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "all"; // all, active, ended, sold
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};

    if (search) {
      searchQuery.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { itemDescription: { $regex: search, $options: "i" } },
      ];
    }

    // Build status filter
    const now = new Date();
    if (status === "active") {
      searchQuery.itemEndDate = { $gt: now };
      searchQuery.isSold = false;
    } else if (status === "ended") {
      searchQuery.itemEndDate = { $lte: now };
      searchQuery.isSold = false;
    } else if (status === "sold") {
      searchQuery.isSold = true;
    }

    // Get total count
    const totalAuctions = await Product.countDocuments(searchQuery);

    // Get auctions with pagination
    const auctions = await Product.find(searchQuery)
      .populate("seller", "name email")
      .populate("winner", "name email")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Add computed fields
    const auctionsWithStatus = auctions.map((auction) => ({
      ...auction,
      timeLeft: Math.max(0, new Date(auction.itemEndDate) - now),
      isExpired: new Date(auction.itemEndDate) <= now,
      bidsCount: auction.bids ? auction.bids.length : 0,
    }));

    const totalPages = Math.ceil(totalAuctions / limit);

    res.status(200).json({
      success: true,
      data: {
        auctions: auctionsWithStatus,
        pagination: {
          currentPage: page,
          totalPages,
          totalAuctions,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải danh sách phiên đấu giá",
      error: error.message,
    });
  }
};

// Admin end auction manually
export const endAuctionManually = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("seller", "name email")
      .populate("bids.bidder", "name email");

    if (!product) {
      return res.status(404).json({ message: "Phiên đấu giá không tồn tại" });
    }

    // Check if already sold
    if (product.isSold) {
      return res.status(400).json({ message: "Phiên đấu giá đã được kết thúc" });
    }

    // If there are bids, set winner to highest bidder
    if (product.bids && product.bids.length > 0) {
      // Sort bids by amount descending to find highest bid
      const sortedBids = [...product.bids].sort((a, b) => b.bidAmount - a.bidAmount);
      const highestBid = sortedBids[0];

      const winnerId = highestBid.bidder._id || highestBid.bidder;
      const winningAmount = highestBid.bidAmount;

      // Lấy thông tin người thắng
      const winner = await User.findById(winnerId);

      if (!winner) {
        return res.status(404).json({ message: "Không tìm thấy người thắng" });
      }

      // Kiểm tra số dư
      if (winner.balance < winningAmount) {
        return res.status(400).json({
          message: `Người thắng không đủ số dư. Cần: ${winningAmount.toLocaleString("vi-VN")} VND, Có: ${winner.balance.toLocaleString("vi-VN")} VND`,
        });
      }

      // Trừ tiền người thắng
      winner.balance -= winningAmount;
      winner.transactions = winner.transactions || [];
      winner.transactions.push({
        type: "bid",
        amount: winningAmount,
        description: `Thanh toán phiên đấu giá: ${product.itemName}`,
        balanceAfter: winner.balance,
        relatedAuctionId: product._id,
      });
      await winner.save();

      // Cộng tiền cho seller
      const seller = await User.findById(product.seller._id);
      if (seller) {
        seller.balance += winningAmount;
        seller.transactions = seller.transactions || [];
        seller.transactions.push({
          type: "topup",
          amount: winningAmount,
          description: `Nhận tiền từ phiên đấu giá: ${product.itemName}`,
          balanceAfter: seller.balance,
          relatedAuctionId: product._id,
        });
        await seller.save();
      }

      product.winner = winnerId;
      product.currentPrice = winningAmount;

      // Create notification for winner
      await Notification.create({
        recipient: winnerId,
        type: "won_auction",
        auction: product._id,
        title: "Bạn đã thắng đấu giá!",
        message: `Bạn đã thắng phiên đấu giá "${product.itemName}" với giá ${winningAmount.toLocaleString("vi-VN")} VND. Số tiền đã được trừ khỏi tài khoản của bạn.`,
      });
    }

    product.isSold = true;
    product.itemEndDate = new Date(); // Set end date to now

    const updatedAuction = await product.save();

    // Create notification for seller
    await Notification.create({
      recipient: product.seller._id,
      type: "auction_ended",
      auction: product._id,
      title: "Phiên đấu giá đã kết thúc",
      message: `Phiên đấu giá "${product.itemName}" đã bị kết thúc bởi admin${product.winner ? " và có người thắng" : " nhưng không có người đấu giá"}`,
    });

    res.status(200).json({
      success: true,
      message: "Phiên đấu giá đã được kết thúc thành công",
      auction: updatedAuction,
    });
  } catch (error) {
    console.error("Error ending auction:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi kết thúc phiên đấu giá",
      error: error.message,
    });
  }
};
