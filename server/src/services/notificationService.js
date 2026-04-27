const Notification = require('../models/Notification');
const { emitToUser } = require('../config/socket');

const createNotification = async ({ userId, type, title, message, data = {}, link = '' }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
      link,
    });

    // Emit real-time notification
    emitToUser(userId.toString(), 'notification', {
      id: notification._id,
      type,
      title,
      message,
      data,
      link,
      createdAt: notification.createdAt,
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

const notifyNearbyUsers = async (listing, nearbyUserIds) => {
  const notifications = nearbyUserIds.map((userId) =>
    createNotification({
      userId,
      type: 'new_listing_nearby',
      title: 'New Food Available Nearby!',
      message: `${listing.title} is available for pickup near you`,
      data: { listingId: listing._id },
      link: `/marketplace/${listing._id}`,
    })
  );
  await Promise.allSettled(notifications);
};

module.exports = { createNotification, notifyNearbyUsers };
