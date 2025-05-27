const firebase = require('../../config/firebase');
const { UserDeviceToken } = require('../../database');

class PushNotificationService {

  async sendNotification(deviceToken, payload) {
    try {
      const message = {
        token: deviceToken,
        notification: {
          title: payload.title,
          body: payload.body
        },
        data: this.stringifyData(payload.data || {}),
        android: {
          priority: payload.priority || 'normal',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      console.log(`Push notification sent successfully: ${response}`);
      
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending push notification:', error);
      
      // Handle invalid token
      if (error.code === 'messaging/invalid-registration-token' || 
          error.code === 'messaging/registration-token-not-registered') {
        await this.removeInvalidToken(deviceToken);
      }
      
      return { success: false, error: error.message };
    }
  }

  async sendBulkNotifications(notifications) {
    try {
      const messages = notifications.map(notif => ({
        token: notif.deviceToken,
        notification: {
          title: notif.payload.title,
          body: notif.payload.body
        },
        data: this.stringifyData(notif.payload.data || {}),
        android: {
          priority: notif.payload.priority || 'normal'
        }
      }));

      const response = await this.messaging.sendAll(messages);
      
      console.log(`Bulk push notifications sent: ${response.successCount}/${notifications.length} successful`);
      
      // Handle failed tokens
      response.responses.forEach((resp, idx) => {
        if (!resp.success && 
            (resp.error.code === 'messaging/invalid-registration-token' ||
             resp.error.code === 'messaging/registration-token-not-registered')) {
          this.removeInvalidToken(notifications[idx].deviceToken);
        }
      });

      return response;
    } catch (error) {
      console.error('Error sending bulk push notifications:', error);
      throw error;
    }
  }

  async sendTopicNotification(topic, payload) {
    try {
      const message = {
        topic: topic,
        notification: {
          title: payload.title,
          body: payload.body
        },
        data: this.stringifyData(payload.data || {})
      };

      const response = await this.messaging.send(message);
      console.log(`Topic notification sent successfully: ${response}`);
      
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending topic notification:', error);
      return { success: false, error: error.message };
    }
  }

  stringifyData(data) {
    const stringifiedData = {};
    Object.keys(data).forEach(key => {
      stringifiedData[key] = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
    });
    return stringifiedData;
  }

  async removeInvalidToken(deviceToken) {
    try {
      await UserDeviceToken.destroy({
        where: { deviceToken }
      });
      console.log(`Removed invalid device token: ${deviceToken}`);
    } catch (error) {
      console.error('Error removing invalid token:', error);
    }
  }

  mapPriorityToFCM(priority) {
    switch (priority) {
      case 'high':
        return 'high';
      case 'low':
        return 'normal';
      default:
        return 'normal';
    }
  }
}

module.exports = new PushNotificationService();