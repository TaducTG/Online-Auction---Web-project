import { Link } from "react-router";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-white">
              Online Auction System
            </h3>
            <p className="text-gray-400 text-sm">
              Your trusted marketplace since 2024
            </p>
          </div>
          <div className="flex space-x-6">
            <span className="text-gray-400 text-sm">About</span>
            <span className="text-gray-400 text-sm">Legal</span>
            <span className="text-gray-400 text-sm">Contact</span>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-6 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Online Auction System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
