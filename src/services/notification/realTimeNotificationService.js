const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { info, error } = require('../../config/logging');

class RealTimeNotificationService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map of userId -> WebSocket connection
  }

  // Initialize WebSocket server
  initializeWebSocketServer(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws/notifications'
    });

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    info('WebSocket server initialized for real-time notifications');
  }

  // Handle new WebSocket connection
  async handleConnection(ws, req) {
    try {
      const token = this.extractTokenFromRequest(req);
      if (!token) {
        ws.close(1008, 'No authentication token provided');
        return;
      }

      const user = await this.verifyToken(token);
      if (!user) {
        ws.close(1008, 'Invalid authentication token');
        return;
      }

      // Store connection with user ID and connection time
      this.clients.set(user.userId, {
        ws,
        user,
        lastHeartbeat: Date.now(),
        connectedAt: new Date().toISOString() 
      });


      info(`WebSocket connection established for user: ${user.userId}`);

      // Set up message handlers
      ws.on('message', (message) => {
        this.handleMessage(user.userId, message);
      });

      ws.on('close', () => {
        this.clients.delete(user.userId);
        info(`WebSocket connection closed for user: ${user.userId}`);
      });

      ws.on('error', (err) => {
        error(`WebSocket error for user ${user.userId}:`, err);
        this.clients.delete(user.userId);
      });

      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connection_established',
        message: 'Real-time notifications connected',
        timestamp: new Date().toISOString()
      }));

    } catch (err) {
      error('Error handling WebSocket connection:', err);
      ws.close(1011, 'Internal server error');
    }
  }

  // Extract token from WebSocket request
  extractTokenFromRequest(req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    return req.headers.authorization?.replace('Bearer ', '');
  }

  // Verify JWT token
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (err) {
      error('Token verification failed:', err);
      return null;
    }
  }

  // Handle incoming messages from clients
  handleMessage(userId, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'heartbeat':
          this.handleHeartbeat(userId);
          break;
        case 'mark_read':
          this.handleMarkRead(userId, data.notificationId);
          break;
        default:
          info(`Unknown message type from user ${userId}:`, data.type);
      }
    } catch (err) {
      error(`Error handling message from user ${userId}:`, err);
    }
  }

  // Handle heartbeat to keep connection alive
  handleHeartbeat(userId) {
    const client = this.clients.get(userId);
    if (client) {
      client.lastHeartbeat = Date.now();
      client.ws.send(JSON.stringify({
        type: 'heartbeat_ack',
        timestamp: new Date().toISOString()
      }));
    }
  }

  // Handle mark as read requests
  async handleMarkRead(userId, notificationId) {
    try {
      // You can call your notification service here
      // await notificationService.markAsRead(notificationId);
      
      const client = this.clients.get(userId);
      if (client) {
        client.ws.send(JSON.stringify({
          type: 'notification_read_ack',
          notificationId,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (err) {
      error(`Error marking notification as read for user ${userId}:`, err);
    }
  }

  // Send notification to specific user
  sendNotificationToUser(userId, notification) {
    const client = this.clients.get(userId);
    
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify({
          type: 'new_notification',
          notification: {
            id: notification.notificationId,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            priority: notification.priority,
            data: notification.data,
            createdAt: notification.createdAt
          },
          timestamp: new Date().toISOString()
        }));

        info(`Real-time notification sent to user: ${userId}`);
        return true;
      } catch (err) {
        error(`Error sending notification to user ${userId}:`, err);
        this.clients.delete(userId);
        return false;
      }
    } else {
      info(`User ${userId} not connected via WebSocket`);
      return false;
    }
  }

  // Send bulk notifications
  sendBulkNotifications(notifications) {
    const results = [];
    
    notifications.forEach(notification => {
      const success = this.sendNotificationToUser(
        notification.recipientId, 
        notification
      );
      results.push({
        recipientId: notification.recipientId,
        success,
        timestamp: new Date().toISOString()
      });
    });

    return results;
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.clients.size;
  }

  // Get connection status for user
  isUserConnected(userId) {
    return this.clients.has(userId);
  }

  // Clean up stale connections
  cleanupStaleConnections() {
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();

    this.clients.forEach((client, userId) => {
      if (now - client.lastHeartbeat > staleThreshold) {
        client.ws.close(1000, 'Connection timeout');
        this.clients.delete(userId);
        info(`Cleaned up stale connection for user: ${userId}`);
      }
    });
  }
  // Disconnect specific user
  disconnectUser(userId) {
    const client = this.clients.get(userId);
    if (client) {
      client.ws.close(1000, 'Disconnected by admin');
      this.clients.delete(userId);
      info(`User ${userId} disconnected by admin`);
      return true;
    }
    return false;
  }
  // Broadcast to all connected users
  broadcastToAll(notificationData) {
    let successful = 0;
    let failed = 0;

    this.clients.forEach((client, userId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify({
            type: 'broadcast_notification',
            notification: notificationData,
            timestamp: new Date().toISOString()
          }));
          successful++;
        } catch (err) {
          error(`Error broadcasting to user ${userId}:`, err);
          this.clients.delete(userId);
          failed++;
        }
      } else {
        this.clients.delete(userId);
        failed++;
      }
    });

    return {
      totalConnected: this.clients.size,
      successful,
      failed
    };
  }
  // Get detailed connection info
  getConnectionInfo() {
    const connections = [];
    this.clients.forEach((client, userId) => {
      connections.push({
        userId,
        connectedAt: client.connectedAt || 'unknown',
        lastHeartbeat: new Date(client.lastHeartbeat).toISOString(),
        status: client.ws.readyState === WebSocket.OPEN ? 'connected' : 'disconnected'
      });
    });

    return {
      totalConnections: this.clients.size,
      connections
    };
  }

  // Start cleanup interval
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupStaleConnections();
    }, 60000); // Run every minute
  }
}

module.exports = new RealTimeNotificationService();