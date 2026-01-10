import React from "react";
import { Link } from "react-router";

export const Hero = () => {
  return (
    <section className="bg-gradient-to-b from-sky-300 to-blue-600 pt-16 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Tương Lai Của
            <span className="text-blue-100 block">Phác Đấu Giá Trực Tuyến</span>
          </h1>

          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Khám phá những vật phẩm độc đáo, đặt giá cạnh tranh và bán những kỳ nắng cho nhà mua hàng trên toàn thế giới. Gồ sám hàng ngàn nhà mua hàng và người bán trong thị trường đáng tin cậy của chúng tôi.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <button className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-md shadow-md hover:bg-blue-50 transition-colors text-lg">
                Đăng Ký
              </button>
            </Link>

            <Link to="/login">
              <button className="bg-transparent text-white border-2 border-white px-8 py-3 rounded-md hover:bg-white/20 transition-colors text-lg">
                Đăng Nhập
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
