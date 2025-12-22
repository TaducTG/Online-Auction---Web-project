import Product from '../models/product.js';
import Notification from '../models/notification.js';
import User from '../models/user.js';
import mongoose from "mongoose"
import { connectDB } from '../connection.js'


export const createAuction = async (req, res) => {
  try {
    console.log("=== CREATE AUCTION REQUEST ===");
    console.log("User:", req.user);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const {
      itemName,
      startingPrice,
      itemDescription,
      itemCategory,
      itemStartDate,
      itemEndDate,
    } = req.body;

    // Validate required fields
    if (
      !itemName ||
      !startingPrice ||
      !itemDescription ||
      !itemCategory ||
      !itemEndDate
    ) {
      console.log("Missing fields validation failed");
      return res
        .status(400)
        .json({
          message:
            "Missing required fields: itemName, startingPrice, itemDescription, itemCategory, itemEndDate are required",
        });
    }

    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ message: "Item photo is required" });
    }

    if (!req.user || !req.user.id) {
      console.log("User authentication failed, req.user:", req.user);
      return res.status(401).json({ message: "Authentication required" });
    }

    // Construct image URL from file path
    const imageUrl = req.file.path;

    console.log("Image URL:", imageUrl);

    const start = itemStartDate ? new Date(itemStartDate) : new Date();
    const end = new Date(itemEndDate);

    console.log("Start Date:", start);
    console.log("End Date:", end);

    if (end <= start) {
      console.log("Invalid date range");
      return res
        .status(400)
        .json({ message: "Auction end date must be after start date" });
    }

    // Ensure seller is a valid ObjectId
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    const newAuction = new Product({
      itemName: String(itemName).trim(),
      startingPrice: Number(startingPrice),
      currentPrice: Number(startingPrice),
      itemDescription: String(itemDescription).trim(),
      itemCategory: String(itemCategory).trim(),
      itemPhoto: imageUrl,
      itemStartDate: start,
      itemEndDate: end,
      seller: sellerId,
    });

    console.log("New Auction Object:", newAuction);

    const savedAuction = await newAuction.save();

    console.log("Auction created successfully:", savedAuction._id);

    res
      .status(201)
      .json({
        message: "Auction created successfully",
        newAuction: savedAuction,
      });
  } catch (error) {
    console.error("=== CREATE AUCTION ERROR ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    res
      .status(500)
      .json({ message: "Error creating auction", error: error.message });
  }
};

export const showAuction = async (req, res) => {
  try {
    const auction = await Product.find({ itemEndDate: { $gt: new Date() } })
      .populate("seller", "name")
      .select(
        "itemName itemDescription currentPrice bids itemEndDate itemCategory itemPhoto seller"
      )
      .sort({ createdAt: -1 });
    const formatted = auction.map((auction) => ({
      _id: auction._id,
      itemName: auction.itemName,
      itemDescription: auction.itemDescription,
      currentPrice: auction.currentPrice,
      bidsCount: auction.bids.length,
      timeLeft: Math.max(0, new Date(auction.itemEndDate) - new Date()),
      itemCategory: auction.itemCategory,
      sellerName: auction.seller.name,
      itemPhoto: auction.itemPhoto,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching auctions", error: error.message });
  }
};

export const auctionById = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Product.findById(id)
      .populate("seller", "name")
      .populate("bids.bidder", "name");
    auction.bids.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));
    res.status(200).json(auction);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching auctions", error: error.message });
  }
};

export const placeBid = async (req, res) => {
  try {
    const { bidAmount } = req.body;
    const user = req.user.id;
    const { id } = req.params;

    const product = await Product.findById(id).populate("bids.bidder", "name");
    if (!product) return res.status(404).json({ message: "Auction not found" });

    if (new Date(product.itemEndDate) < new Date())
      return res.status(400).json({ message: "Auction has already ended" });

    const amount = Number(bidAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Gia bid khong hop le" });
    }
    
    if (!Number.isInteger(amount)) {
      return res.status(400).json({ message: "Gia bid phai la so nguyen" });
    }

    const bidder = await User.findById(user).select("balance");
    if (!bidder) return res.status(404).json({ message: "User not found" });

    const base = Number(product.startingPrice);
    const currentPrice = Number(product.currentPrice);
    
    // Min bid: current price + 80% of starting price, min must be at least currentPrice + 1
    // Max bid: current price + 500% of starting price
    const minBid = Math.max(currentPrice + 1, Math.ceil(currentPrice + base * 0.8));
    const maxBid = Math.floor(currentPrice + base * 5);

    if (minBid > maxBid) {
      return res.status(400).json({ message: "Khong the dat bid cao hon voi quy tac hien tai" });
    }

    if (amount < minBid) {
      return res
        .status(400)
        .json({ message: `Bid toi thieu: ${minBid.toLocaleString("vi-VN")} VND` });
    }
    if (amount > maxBid) {
      return res
        .status(400)
        .json({ message: `Bid toi da: ${maxBid.toLocaleString("vi-VN")} VND` });
    }
    if (amount > bidder.balance) {
      return res.status(400).json({
        message: `So du khong du (so du: ${bidder.balance.toLocaleString("vi-VN")} VND)`,
      });
    }

    // Get previous highest bidder before updating
    const previousBidder =
      product.bids.length > 0 ? product.bids[product.bids.length - 1].bidder : null;

    product.bids.push({
      bidder: user,
      bidAmount: amount,
    });

    product.currentPrice = amount;
    await product.save();

    // Create notification for previous bidder (outbid)
    if (previousBidder && previousBidder._id.toString() !== user) {
      await Notification.create({
        recipient: previousBidder._id,
        type: 'outbid',
        auction: id,
        actor: user,
        title: 'Outbid!',
        message: `Co nguoi dat bid cao hon cho "${product.itemName}". Bid moi: ${amount.toLocaleString("vi-VN")} VND`
      });
    }

    // Create notification for seller (bid placed)
    if (product.seller.toString() !== user) {
      await Notification.create({
        recipient: product.seller,
        type: 'bid',
        auction: id,
        actor: user,
        title: 'New Bid Placed',
        message: `Co nguoi bid san pham "${product.itemName}". Bid moi: ${amount.toLocaleString("vi-VN")} VND`
      });
    }

    res.status(200).json({ message: "Bid placed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error placing bid", error: error.message })
  }
}

export const dashboardData = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const dateNow = new Date();
    const stats = await Product.aggregate([
      {
        $facet: {
          totalAuctions: [{ $count: "count" }],
          userAuctionCount: [
            { $match: { seller: userObjectId } },
            { $count: "count" },
          ],
          activeAuctions: [
            {
              $match: {
                itemStartDate: { $lte: dateNow },
                itemEndDate: { $gte: dateNow },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);

    const totalAuctions = stats[0].totalAuctions[0]?.count || 0;
    const userAuctionCount = stats[0].userAuctionCount[0]?.count || 0;
    const activeAuctions = stats[0].activeAuctions[0]?.count || 0;

    const globalAuction = await Product.find({ itemEndDate: { $gt: dateNow } })
      .populate("seller", "name")
      .sort({ createdAt: -1 })
      .limit(3);
    const latestAuctions = globalAuction.map((auction) => ({
      _id: auction._id,
      itemName: auction.itemName,
      itemDescription: auction.itemDescription,
      currentPrice: auction.currentPrice,
      bidsCount: auction.bids.length,
      timeLeft: Math.max(0, new Date(auction.itemEndDate) - new Date()),
      itemCategory: auction.itemCategory,
      sellerName: auction.seller.name,
      itemPhoto: auction.itemPhoto,
    }));

    const userAuction = await Product.find({ seller: userObjectId })
      .populate("seller", "name")
      .sort({ createdAt: -1 })
      .limit(3);
    const latestUserAuctions = userAuction.map((auction) => ({
      _id: auction._id,
      itemName: auction.itemName,
      itemDescription: auction.itemDescription,
      currentPrice: auction.currentPrice,
      bidsCount: auction.bids.length,
      timeLeft: Math.max(0, new Date(auction.itemEndDate) - new Date()),
      itemCategory: auction.itemCategory,
      sellerName: auction.seller.name,
      itemPhoto: auction.itemPhoto,
    }));

    return res
      .status(200)
      .json({
        totalAuctions,
        userAuctionCount,
        activeAuctions,
        latestAuctions,
        latestUserAuctions,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting dashboard data", error: error.message });
  }
};

export const myAuction = async (req, res) => {
  try {
    const auction = await Product.find({ seller: req.user.id })
      .populate("seller", "name")
      .select(
        "itemName itemDescription currentPrice bids itemEndDate itemCategory itemPhoto seller"
      )
      .sort({ createdAt: -1 });
    const formatted = auction.map((auction) => ({
      _id: auction._id,
      itemName: auction.itemName,
      itemDescription: auction.itemDescription,
      currentPrice: auction.currentPrice,
      bidsCount: auction.bids.length,
      timeLeft: Math.max(0, new Date(auction.itemEndDate) - new Date()),
      itemCategory: auction.itemCategory,
      sellerName: auction.seller.name,
      itemPhoto: auction.itemPhoto,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching auctions", error: error.message });
  }
};
