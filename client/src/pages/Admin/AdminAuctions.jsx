import React, { useState, useEffect } from 'react';
import { getAllAuctions, endAuctionManually } from '../../api/admin';
import LoadingScreen from '../../components/LoadingScreen';

export const AdminAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pagination, setPagination] = useState({});

  // Filters and sorting
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [limit, setLimit] = useState(10);

  // Loading states
  const [isEndingAuction, setIsEndingAuction] = useState(null);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllAuctions(page, search, status, limit, sortBy, sortOrder);
      setAuctions(data.data.auctions || []);
      setPagination(data.data.pagination || {});
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError('Failed to load auctions');
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, status, sortBy, sortOrder]);

  useEffect(() => {
    fetchAuctions();
  }, [page, search, status, sortBy, sortOrder, limit]);

  const handleEndAuction = async (auctionId, auctionName) => {
    if (!window.confirm(`Bạn có chắc muốn kết thúc phiên đấu giá "${auctionName}"?`)) {
      return;
    }

    try {
      setIsEndingAuction(auctionId);
      await endAuctionManually(auctionId);
      setSuccess('Phiên đấu giá đã được kết thúc thành công');
      fetchAuctions();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error ending auction:', err);
      console.error('Error details:', {
        status: err?.response?.status,
        message: err?.response?.data?.message,
        data: err?.response?.data,
        fullError: err
      });
      setError(err?.response?.data?.message || err?.message || 'Lỗi khi kết thúc phiên đấu giá');
    } finally {
      setIsEndingAuction(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeLeft = (timeLeft) => {
    if (timeLeft <= 0) return 'Hết thời gian';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusBadge = (auction) => {
    if (auction.isSold) {
      return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Đã bán</span>;
    }
    if (auction.isExpired) {
      return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Hết thời gian</span>;
    }
    return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Đang diễn ra</span>;
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Phiên Đấu Giá</h1>
          <p className="text-gray-600">Xem và quản lý tất cả các phiên đấu giá</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tên sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang diễn ra</option>
                <option value="ended">Hết thời gian</option>
                <option value="sold">Đã bán</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sắp xếp theo
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Ngày tạo</option>
                <option value="itemEndDate">Ngày kết thúc</option>
                <option value="currentPrice">Giá cao nhất</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thứ tự
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Giảm dần</option>
                <option value="asc">Tăng dần</option>
              </select>
            </div>

            {/* Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Auctions Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {auctions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Không tìm thấy phiên đấu giá nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Người bán
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Giá hiện tại
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Đấu giá
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Kết thúc lúc
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Thời gian còn lại
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auctions.map((auction) => (
                    <tr key={auction._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {auction.itemPhoto && (
                            <img
                              src={auction.itemPhoto}
                              alt={auction.itemName}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 max-w-xs truncate">
                              {auction.itemName}
                            </p>
                            <p className="text-sm text-gray-500">{auction.itemCategory}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {auction.seller?.name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">{auction.seller?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-blue-600">
                          {formatPrice(auction.currentPrice)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-medium text-gray-900">
                          {auction.bidsCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(auction.itemEndDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${auction.isExpired ? 'text-red-600' : 'text-green-600'}`}>
                          {getTimeLeft(auction.timeLeft)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(auction)}
                      </td>
                      <td className="px-6 py-4">
                        {!auction.isSold && (
                          <button
                            onClick={() => handleEndAuction(auction._id, auction.itemName)}
                            disabled={isEndingAuction === auction._id}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {isEndingAuction === auction._id ? 'Đang xử lý...' : 'Kết thúc'}
                          </button>
                        )}
                        {auction.isSold && (
                          <span className="text-gray-500 text-sm">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-md transition ${
                  page === p
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>

            <span className="ml-4 text-sm text-gray-600">
              Trang {pagination.currentPage} / {pagination.totalPages} (Tổng: {pagination.totalAuctions})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
