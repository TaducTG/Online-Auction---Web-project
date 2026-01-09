import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser, topUpBalance } from "../api/user";
import LoadingScreen from "../components/LoadingScreen";
import { FaWallet, FaPlus, FaCheck, FaTimes } from "react-icons/fa";

const formatVND = (value) => `${Number(value ?? 0).toLocaleString("vi-VN")} VND`;

const TOP_UP_AMOUNTS = [
  { value: 100000, label: "100K" },
  { value: 500000, label: "500K" },
  { value: 1000000, label: "1M" },
  { value: 5000000, label: "5M" },
  { value: 10000000, label: "10M" },
];

export default function Wallet() {
  const { user } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    staleTime: 10 * 1000,
  });

  const topUpMutation = useMutation({
    mutationFn: (amount) => topUpBalance({ amount }),
    onSuccess: (data) => {
      // Update user data including transactions
      queryClient.invalidateQueries({ queryKey: ["user"] });
      
      // Reset inputs
      setSelectedAmount(null);
      setCustomAmount("");
    },
    onError: (error) => {
      console.error("Top-up error:", error);
    },
  });

  const handleTopUp = (amount) => {
    if (!amount || amount <= 0) {
      alert("Vui lòng chọn số tiền hợp lệ");
      return;
    }
    topUpMutation.mutate(amount);
  };

  const handleCustomTopUp = () => {
    const amount = Number(customAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    handleTopUp(amount);
  };

  if (isLoading) return <LoadingScreen />;

  const currentBalance = userData?.user?.balance || 0;
  const transactions = userData?.user?.transactions || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FaWallet className="text-3xl text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Số Dư</h1>
          </div>
          <p className="text-gray-600">Nạp tiền và theo dõi lịch sử giao dịch</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 mb-8 text-white">
          <p className="text-sm font-medium opacity-90 mb-2">Số dư hiện tại</p>
          <h2 className="text-4xl font-bold mb-2">{formatVND(currentBalance)}</h2>
          <p className="text-sm opacity-75">Sử dụng để tham gia đấu giá</p>
        </div>

        {/* Top-up Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaPlus className="text-blue-600" />
            Nạp Tiền
          </h3>

          {/* Preset Amounts */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Chọn mệnh giá:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {TOP_UP_AMOUNTS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedAmount(option.value);
                    setCustomAmount("");
                  }}
                  className={`p-3 rounded-lg font-medium transition-colors ${
                    selectedAmount === option.value
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Hoặc nhập số tiền khác:</p>
            <div className="flex gap-3">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder="Nhập số tiền (VND)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Top-up Button */}
          <button
            onClick={() => handleTopUp(selectedAmount || customAmount)}
            disabled={topUpMutation.isPending || (!selectedAmount && !customAmount)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            {topUpMutation.isPending ? "Đang xử lý..." : <><FaPlus /> Nạp Tiền Ngay</>}
          </button>

          {topUpMutation.isError && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
              <FaTimes /> Nạp tiền thất bại. Vui lòng thử lại.
            </div>
          )}

          {topUpMutation.isSuccess && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
              <FaCheck /> Nạp tiền thành công!
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">Lịch Sử Giao Dịch</h3>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Số tiền
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Số dư mới
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.type === 'topup' 
                            ? 'bg-green-100 text-green-800'
                            : transaction.type === 'bid'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.type === 'topup' ? 'Nạp Tiền' : transaction.type === 'bid' ? 'Đấu Giá' : 'Hoàn Tiền'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold">
                        <span className={`${
                          transaction.type === 'topup' 
                            ? 'text-green-600'
                            : transaction.type === 'bid'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }`}>
                          {transaction.type === 'topup' ? '+' : transaction.type === 'bid' ? '-' : '+'}
                          {formatVND(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                        {formatVND(transaction.balanceAfter)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
