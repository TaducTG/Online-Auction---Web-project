import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAuction } from "../api/auction.js";
import { useRef } from "react";
import { useNavigate } from "react-router";

export const CreateAuction = () => {
  const fileInputRef = useRef();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    itemName: "",
    itemDescription: "",
    itemCategory: "",
    startingPrice: "",
    itemStartDate: "",
    itemStartHour: "00",
    itemStartMinute: "00",
    itemStartSecond: "00",
    itemEndDate: "",
    itemEndHour: "00",
    itemEndMinute: "00",
    itemEndSecond: "00",
    itemPhoto: "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createAuction,
    onSuccess: (data) => {
      console.log("API Response:", data);
      setFormData({
        itemName: "",
        itemDescription: "",
        itemCategory: "",
        startingPrice: "",
        itemStartDate: "",
        itemStartHour: "00",
        itemStartMinute: "00",
        itemStartSecond: "00",
        itemEndDate: "",
        itemEndHour: "00",
        itemEndMinute: "00",
        itemEndSecond: "00",
        itemPhoto: "",
      });
      setError("");
      queryClient.invalidateQueries({ queryKey: ["viewAuctions"] });
      queryClient.invalidateQueries({ queryKey: ["allAuction"] });
      queryClient.invalidateQueries({ queryKey: ["myauctions"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });

      if (data && data.newAuction && data.newAuction._id) {
        navigate(`/auction/${data.newAuction._id}`);
      } else {
        console.error("Invalid response structure:", data);
        setError("Auction created but unable to navigate. Please check your auctions list.");
      }
    },
    onError: (error) => {
      console.log("Error at line 43:", error);
      setError(error?.response?.data?.message || "Something went wrong");
    },
  });

  const categories = [
    "Electronics",
    "Antiques",
    "Art",
    "Books",
    "Clothing",
    "Collectibles",
    "Home & Garden",
    "Jewelry",
    "Musical Instruments",
    "Sports",
    "Toys",
    "Vehicles",
    "Other",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024);

      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed.");
        return;
      }

      if (fileSizeMB > 5) {
        setError(`File size must be less than 5 MB.`);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        itemPhoto: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemPhoto) {
      setError("Please upload an image.");
      return;
    }

    // Pad time values with leading zero
    const padTime = (value) => String(value).padStart(2, "0");

    // Construct full datetime with hours, minutes, seconds
    const startTimeString = `${formData.itemStartDate}T${padTime(formData.itemStartHour)}:${padTime(formData.itemStartMinute)}:${padTime(formData.itemStartSecond)}`;
    const endTimeString = `${formData.itemEndDate}T${padTime(formData.itemEndHour)}:${padTime(formData.itemEndMinute)}:${padTime(formData.itemEndSecond)}`;

    const startDateTime = new Date(startTimeString);
    const endDateTime = new Date(endTimeString);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setError("Invalid date/time format.");
      return;
    }

    if (endDateTime <= startDateTime) {
      setError("End date/time must be after start date/time.");
      return;
    }

    // Send data with datetime strings
    const submitData = {
      ...formData,
      itemStartDate: startDateTime.toISOString(),
      itemEndDate: endDateTime.toISOString(),
    };

    mutate(submitData);
  };

  //   today date
  const today = new Date().toISOString().split("T")[0];

  //   today+15 days
  const maxStart = new Date();
  maxStart.setDate(maxStart.getDate() + 15);
  const maxStartDate = maxStart.toISOString().split("T")[0];

  //   max end date
  let maxEndDate = "";
  if (formData.itemStartDate) {
    const end = new Date(formData.itemStartDate);
    end.setDate(end.getDate() + 15);
    maxEndDate = end.toISOString().split("T")[0];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-md shadow-md border border-gray-200">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Item Name */}
              <div>
                <label
                  htmlFor="itemName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tên Sản Phẩm <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="itemName"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập tên sản phẩm của bạn"
                  required
                />
              </div>

              {/* Item Description */}
              <div>
                <label
                  htmlFor="itemDescription"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mô Tả Sản Phẩm <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="itemDescription"
                  name="itemDescription"
                  value={formData.itemDescription}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  placeholder="Cung cấp mô tả chi tiết về sản phẩm của bạn bao gồm tình trạng, tính năng và bất kỳ thông tin có liên quan"
                  required
                />
              </div>

              {/* Category and Starting Price Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Item Category */}
                <div>
                  <label
                    htmlFor="itemCategory"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Danh Mục <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="itemCategory"
                    name="itemCategory"
                    value={formData.itemCategory}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Starting Price */}
                <div>
                  <label
                    htmlFor="startingPrice"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Giá Bắt Đầu (VND) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    id="startingPrice"
                    name="startingPrice"
                    value={formData.startingPrice}
                    onChange={handleInputChange}
                    min="1"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                    required
                  />
                </div>
              </div>

              {/* Start and End Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date and Time */}
                <div>
                  <label
                    htmlFor="itemStartDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ngày Bắt Đầu Đấu Giá <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    id="itemStartDate"
                    name="itemStartDate"
                    min={today}
                    value={formData.itemStartDate}
                    max={maxStartDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {/* Start Time */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div>
                      <label
                        htmlFor="itemStartHour"
                        className="block text-xs font-medium text-gray-600 mb-1"
                      >
                        Giờ (00-23)
                      </label>
                      <input
                        type="number"
                        id="itemStartHour"
                        name="itemStartHour"
                        min="0"
                        max="23"
                        value={formData.itemStartHour}
                        onChange={handleInputChange}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="itemStartMinute"
                        className="block text-xs font-medium text-gray-600 mb-1"
                      >
                        Phút (00-59)
                      </label>
                      <input
                        type="number"
                        id="itemStartMinute"
                        name="itemStartMinute"
                        min="0"
                        max="59"
                        value={formData.itemStartMinute}
                        onChange={handleInputChange}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="itemStartSecond"
                        className="block text-xs font-medium text-gray-600 mb-1"
                      >
                        Giây (00-59)
                      </label>
                      <input
                        type="number"
                        id="itemStartSecond"
                        name="itemStartSecond"
                        min="0"
                        max="59"
                        value={formData.itemStartSecond}
                        onChange={handleInputChange}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* End Date and Time */}
                <div>
                  <label
                    htmlFor="itemEndDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ngày Kết Thúc Đấu Giá <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    id="itemEndDate"
                    name="itemEndDate"
                    value={formData.itemEndDate}
                    onChange={handleInputChange}
                    min={formData.itemStartDate}
                    max={maxEndDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {/* End Time */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div>
                      <label
                        htmlFor="itemEndHour"
                        className="block text-xs font-medium text-gray-600 mb-1"
                      >
                        Giờ (00-23)
                      </label>
                      <input
                        type="number"
                        id="itemEndHour"
                        name="itemEndHour"
                        min="0"
                        max="23"
                        value={formData.itemEndHour}
                        onChange={handleInputChange}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="itemEndMinute"
                        className="block text-xs font-medium text-gray-600 mb-1"
                      >
                        Phút (00-59)
                      </label>
                      <input
                        type="number"
                        id="itemEndMinute"
                        name="itemEndMinute"
                        min="0"
                        max="59"
                        value={formData.itemEndMinute}
                        onChange={handleInputChange}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="itemEndSecond"
                        className="block text-xs font-medium text-gray-600 mb-1"
                      >
                        Giây (00-59)
                      </label>
                      <input
                        type="number"
                        id="itemEndSecond"
                        name="itemEndSecond"
                        min="0"
                        max="59"
                        value={formData.itemEndSecond}
                        onChange={handleInputChange}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Item Photo */}
              <div>
                <label
                  htmlFor="itemPhoto"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Hình ảnh Sản Phẩm <span className="text-red-600">*</span>
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    id="itemPhoto"
                    name="itemPhoto"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {formData.itemPhoto && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Xem trước:</p>
                      <img
                        src={URL.createObjectURL(formData.itemPhoto)}
                        alt="Preview"
                        className="w-32 h-32 object-cover border border-gray-300 rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, itemPhoto: "" }));
                          fileInputRef.current.value = "";
                        }}
                        className="mt-2 text-sm text-red-600 hover:underline"
                      >
                        Xóa Hình ảnh
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 sm:flex-none bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isPending ? "Đang Tạo Đấu Giá..." : "Tạo Đấu Giá"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Help Section */}
        <HelpSection />
      </main>
    </div>
  );
};

export const HelpSection = () => {
  return (
    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">
        Mẹo Đế Tạo Một Phiên Đấu Giá Thành Công
      </h3>
      <ul className="space-y-2 text-blue-800 text-sm">
        <li className="flex items-start">
          <span className="text-blue-600 mr-2">•</span>
          Sử dụng những bức ảnh rõ nét, chất lượng cao thể hiện sản phẩm của bạn từ nhiều góc độ
        </li>
        <li className="flex items-start">
          <span className="text-blue-600 mr-2">•</span>
          Viết mô tả chi tiết bao gồm tình trạng, kích thước và bất kỳ lỗi
        </li>
        <li className="flex items-start">
          <span className="text-blue-600 mr-2">•</span>
          Đặt một giá bắt đầu hợp lý để thu hút các nhà đặt giá
        </li>
        <li className="flex items-start">
          <span className="text-blue-600 mr-2">•</span>
          Chọn thời lượng phiên đấu giá phù hợp (3-7 ngày thường tốt nhất)
        </li>
        <li className="flex items-start">
          <span className="text-blue-600 mr-2">•</span>
          Chọn danh mục chính xác để giúp nhà mua hàng tìm thấy sản phẩm của bạn
        </li>
      </ul>
    </div>
  );
};
