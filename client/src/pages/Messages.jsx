import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
} from "../api/notification";
import { MdNotifications, MdDeleteOutline, MdDoneAll } from "react-icons/md";

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

const getNotificationColor = (type) => {
  switch (type) {
    case 'bid':
      return 'bg-blue-50 border-blue-200';
    case 'outbid':
      return 'bg-red-50 border-red-200';
    case 'auction_ended':
      return 'bg-yellow-50 border-yellow-200';
    case 'won_auction':
      return 'bg-green-50 border-green-200';
    default:
      return 'bg-gray-50 border-gray-200';
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

export default function Messages() {
  const queryClient = useQueryClient();

  const { data: notifData, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
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

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      refetch();
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: () => {
      refetch();
    },
  });

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <MdNotifications className="mr-3 h-8 w-8 text-indigo-600" />
                Messages & Notifications
              </h1>
              <p className="text-gray-600 mt-2">
                Stay updated on your auctions and bids
              </p>
            </div>
            {unreadCount > 0 && (
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full">
                <span className="font-semibold">{unreadCount} unread</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {notifications.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <MdDoneAll className="h-5 w-5" />
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all notifications?')) {
                    deleteAllMutation.mutate();
                  }
                }}
                disabled={deleteAllMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                <MdDeleteOutline className="h-5 w-5" />
                Delete all
              </button>
            </div>
          )}
        </div>

        {/* Notifications list */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <MdNotifications className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No notifications yet</p>
              <p className="text-gray-400">You'll see updates about your auctions and bids here</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`border-l-4 rounded-lg p-4 transition-all hover:shadow-md ${getNotificationColor(notification.type)} ${!notification.isRead ? 'border-l-indigo-500 bg-opacity-75' : 'border-l-gray-300'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <span className="text-3xl mt-1">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="inline-block h-2 w-2 bg-indigo-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-700 mt-1">
                        {notification.message}
                      </p>
                      {notification.auction && (
                        <div className="mt-3 p-2 bg-white bg-opacity-50 rounded-md flex items-center gap-2">
                          {notification.auction.itemPhoto && (
                            <img
                              src={notification.auction.itemPhoto}
                              alt={notification.auction.itemName}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {notification.auction.itemName}
                            </p>
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsReadMutation.mutate(notification._id)}
                        disabled={markAsReadMutation.isPending}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                        title="Mark as read"
                      >
                        <MdDoneAll className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this notification?')) {
                          deleteNotificationMutation.mutate(notification._id);
                        }
                      }}
                      disabled={deleteNotificationMutation.isPending}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-md transition-colors"
                      title="Delete"
                    >
                      <MdDeleteOutline className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
