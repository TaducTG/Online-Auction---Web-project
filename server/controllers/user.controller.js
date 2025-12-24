import Login from "../models/Login.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export const handleGetUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email avatar role phone address bio balance transactions"
    );

    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export const handleChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ các trường" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ error: "Mật khẩu mới và xác nhận mật khẩu không khớp" });
    }
    if (currentPassword === newPassword) {
      return res
        .status(400)
        .json({ error: "Bạn không thể sử dụng lại mật khẩu cũ" });
    }

    const userID = req.user.id;

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Mật khẩu hiện tại không chính xác" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("Error changing password:", err);
    return res
      .status(500)
      .json({ error: "Đã xảy ra lỗi. Vui lòng thử lại sau" });
  }
};

export const getLoginHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const logins = await Login.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      },
      {
        $sort: { loginAt: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    const formatted = logins.map((login) => {
      const date = new Date(login.loginAt);
      const formattedDate = date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const location = [
        login.location?.city,
        login.location?.region,
        login.location?.country,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        id: login._id,
        dateTime: formattedDate,
        ipAddress: login.ipAddress || "Unknown",
        location: location || "Unknown",
        isp: login.location?.isp || "Unknown",
        device: getDeviceType(login.userAgent),
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching login history:", error);
    res.status(500).json({
      success: false,
      message: "Không thể tải lịch sử đăng nhập",
    });
  }
};

function getDeviceType(userAgent = "") {
  userAgent = userAgent.toLowerCase();
  if (/mobile|iphone|ipod|android.*mobile|windows phone/.test(userAgent))
    return "Mobile";
  if (/tablet|ipad|android(?!.*mobile)/.test(userAgent)) return "Tablet";
  return "Desktop";
}

export const handleUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, bio } = req.body;

    // Validate name
    if (name && name.trim().length < 2) {
      return res
        .status(400)
        .json({ error: "Tên phải có ít nhất 2 ký tự" });
    }

    // Validate phone (optional: basic validation)
    if (phone && !/^\+?[\d\s\-()]+$/.test(phone)) {
      return res.status(400).json({ error: "Định dạng số điện thoại không hợp lệ" });
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (address) {
      updateData.address = {
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zipCode: address.zipCode || "",
        country: address.country || "",
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("name email avatar role phone address bio balance");

    if (!updatedUser) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    res.status(200).json({
      message: "Cập nhật hồ sơ thành công",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ error: "Đã xảy ra lỗi. Vui lòng thử lại sau" });
  }
};

export const handleTopUp = async (req, res) => {
  try {
    const { amount } = req.body;
    const topUpAmount = Number(amount);

    if (!Number.isFinite(topUpAmount) || topUpAmount <= 0) {
      return res.status(400).json({ error: "Số tiền nạp không hợp lệ" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Không tìm thấy người dùng" });

    // Update balance
    user.balance += topUpAmount;

    // Add transaction to history
    user.transactions.push({
      type: 'topup',
      amount: topUpAmount,
      description: `Nạp tiền ${(topUpAmount).toLocaleString('vi-VN')} VND`,
      balanceAfter: user.balance,
      createdAt: new Date()
    });

    await user.save();

    const updated = await User.findById(req.user.id).select(
      "name email avatar role phone address bio balance transactions"
    );

    return res.status(200).json({
      message: "Nạp tiền thành công",
      user: updated,
    });
  } catch (error) {
    console.error("Top-up error:", error);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
};
