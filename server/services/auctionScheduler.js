import cron from 'node-cron';
import Product from '../models/product.js';
import User from '../models/user.js';
import Notification from '../models/notification.js';

// Hàm xử lý kết thúc đấu giá
export const processEndedAuctions = async () => {
  try {
    console.log('=== KIỂM TRA ĐẤU GIÁ ĐÃ KẾT THÚC ===');
    
    // Tìm tất cả đấu giá đã kết thúc nhưng chưa được xử lý
    const endedAuctions = await Product.find({
      itemEndDate: { $lte: new Date() },
      isSold: false,
      winner: null
    }).populate('bids.bidder', 'name balance');

    console.log(`Tìm thấy ${endedAuctions.length} đấu giá cần xử lý`);

    for (const auction of endedAuctions) {
      try {
        // Nếu không có bid nào
        if (auction.bids.length === 0) {
          console.log(`Đấu giá "${auction.itemName}" không có bid nào`);
          
          // Gửi thông báo cho seller
          await Notification.create({
            recipient: auction.seller,
            type: 'auction_ended',
            auction: auction._id,
            title: 'Đấu giá kết thúc',
            message: `Đấu giá "${auction.itemName}" đã kết thúc mà không có bid nào`
          });
          
          // Đánh dấu là đã xử lý (không bán được)
          auction.isSold = false;
          await auction.save();
          continue;
        }

        // Tìm bid cao nhất (bid cuối cùng vì đã được sort)
        const highestBid = auction.bids[auction.bids.length - 1];
        const winnerId = highestBid.bidder._id;
        const winningAmount = highestBid.bidAmount;

        console.log(`Đấu giá "${auction.itemName}" - Người thắng: ${highestBid.bidder.name}, Giá: ${winningAmount.toLocaleString('vi-VN')} VND`);

        // Lấy thông tin người thắng
        const winner = await User.findById(winnerId);
        
        if (!winner) {
          console.error(`Không tìm thấy người thắng cho đấu giá ${auction._id}`);
          continue;
        }

        // Kiểm tra số dư
        if (winner.balance < winningAmount) {
          console.log(`Người thắng không đủ số dư. Cần: ${winningAmount}, Có: ${winner.balance}`);
          
          // Gửi thông báo cho người thắng
          await Notification.create({
            recipient: winnerId,
            type: 'auction_ended',
            auction: auction._id,
            title: 'Không đủ số dư',
            message: `Bạn thắng đấu giá "${auction.itemName}" nhưng không đủ số dư để thanh toán. Đấu giá đã bị hủy.`
          });

          // Gửi thông báo cho seller
          await Notification.create({
            recipient: auction.seller,
            type: 'auction_ended',
            auction: auction._id,
            title: 'Đấu giá bị hủy',
            message: `Đấu giá "${auction.itemName}" bị hủy vì người thắng không đủ số dư`
          });

          // Đánh dấu đã xử lý nhưng không bán được
          auction.isSold = false;
          await auction.save();
          continue;
        }

        // Trừ tiền người thắng
        winner.balance -= winningAmount;
        await winner.save();

        // Cộng tiền cho seller
        const seller = await User.findById(auction.seller);
        if (seller) {
          seller.balance += winningAmount;
          await seller.save();
        }

        // Cập nhật auction
        auction.winner = winnerId;
        auction.isSold = true;
        await auction.save();

        // Gửi thông báo cho người thắng
        await Notification.create({
          recipient: winnerId,
          type: 'won_auction',
          auction: auction._id,
          title: 'Chúc mừng! Bạn đã thắng đấu giá',
          message: `Bạn đã thắng đấu giá "${auction.itemName}" với giá ${winningAmount.toLocaleString('vi-VN')} VND. Số tiền đã được trừ khỏi tài khoản của bạn.`
        });

        // Gửi thông báo cho seller
        await Notification.create({
          recipient: auction.seller,
          type: 'auction_ended',
          auction: auction._id,
          actor: winnerId,
          title: 'Đấu giá đã kết thúc',
          message: `Đấu giá "${auction.itemName}" đã kết thúc. Người thắng: ${winner.name}, Giá bán: ${winningAmount.toLocaleString('vi-VN')} VND`
        });

        // Gửi thông báo cho tất cả người tham gia (trừ winner)
        const participantIds = [...new Set(
          auction.bids
            .map(bid => bid.bidder._id.toString())
            .filter(id => id !== winnerId.toString())
        )];

        for (const participantId of participantIds) {
          await Notification.create({
            recipient: participantId,
            type: 'auction_ended',
            auction: auction._id,
            actor: winnerId,
            title: 'Đấu giá đã kết thúc',
            message: `Đấu giá "${auction.itemName}" đã kết thúc. Người thắng: ${winner.name}, Giá cuối: ${winningAmount.toLocaleString('vi-VN')} VND`
          });
        }

        console.log(`✅ Xử lý thành công đấu giá "${auction.itemName}"`);

      } catch (error) {
        console.error(`Lỗi khi xử lý đấu giá ${auction._id}:`, error);
      }
    }

    console.log('=== HOÀN TẤT KIỂM TRA ĐẤU GIÁ ===');
  } catch (error) {
    console.error('Lỗi trong processEndedAuctions:', error);
  }
};

// Khởi tạo cron job - chạy mỗi phút
export const startAuctionScheduler = () => {
  // Chạy mỗi phút để kiểm tra đấu giá đã kết thúc
  cron.schedule('* * * * *', async () => {
    await processEndedAuctions();
  });

  console.log('✅ Auction scheduler đã được khởi động - kiểm tra mỗi phút');
  
  // Chạy ngay lần đầu tiên khi server khởi động
  processEndedAuctions();
};
