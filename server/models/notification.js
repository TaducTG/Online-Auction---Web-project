import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['bid', 'outbid', 'auction_ended', 'won_auction'],
        required: true
    },
    auction: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    actor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
