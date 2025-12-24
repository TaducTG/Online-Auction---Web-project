import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['topup', 'bid', 'refund'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    balanceAfter: {
        type: Number,
        required: true
    },
    relatedAuctionId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
    },
    phone: {
        type: String,
        default: ''
    },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zipCode: { type: String, default: '' },
        country: { type: String, default: '' }
    },
    bio: {
        type: String,
        default: ''
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    transactions: [transactionSchema],
     role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    location: {
        country: { type: String },
        region: { type: String },
        city: { type: String },
        isp: { type: String }
    },
    signupAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;