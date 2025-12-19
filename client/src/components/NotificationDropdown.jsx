import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/notification";
import { MdNotifications, MdDoneAll } from "react-icons/md";

const getNotificationIcon = (type) => {
  switch (type) {
    case 'bid':
      return '🏷️';
    case 'outbid':
      return '📉';
    case 'auction_ended':
      return '⏱️';
    case 'won_auction':
      return '🎉';
    default:
      return '📬';
  }
};

const formatDate = (date) => {
  const now = new Date();
  const notifDate = new Date(date);
  const diffMs = now - notifDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return notifDate.toLocaleDateString();
};

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { data: notifData, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      refetch();
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      refetch();
    },
  });

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;
  const displayNotifications = notifications.slice(0, 5); // Show only 5 in dropdown

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
    setIsOpen(false);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/messages");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <MdNotifications className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-lg">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 flex items-center gap-1"
              >
                <MdDoneAll className="h-4 w-4" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : displayNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <MdNotifications className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {displayNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="inline-block h-2 w-2 bg-indigo-600 rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        {notification.auction && (
                          <div className="mt-2 flex items-center gap-2">
                            {notification.auction.itemPhoto && (
                              <img
                                src={notification.auction.itemPhoto}
                                alt={notification.auction.itemName}
                                className="h-8 w-8 rounded object-cover"
                              />
                            )}
                            <p className="text-xs font-medium text-gray-700 truncate">
                              {notification.auction.itemName}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with View All */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={handleViewAll}
                className="w-full py-2 text-center text-indigo-600 hover:text-indigo-800 font-medium text-sm hover:bg-indigo-50 rounded transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
