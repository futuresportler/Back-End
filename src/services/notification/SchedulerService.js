const cron = require('node-cron');
const notificationService = require('./notificationService');
const { AcademyProfile, AcademyBatch, AcademyProgram } = require('../../database');
const { info, error } = require('../../config/logging');

class SchedulerService {
  
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  // Start all scheduled jobs
  startScheduler() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    // Daily feedback reminder generation (9 AM every day)
    this.scheduleJob('daily-feedback-reminders', '0 9 * * *', async () => {
      console.log('Generating daily feedback reminders...');
      await this.generateDailyFeedbackReminders();
    });

    // Weekly bulk feedback notifications (Monday 10 AM)
    this.scheduleJob('weekly-bulk-feedback', '0 10 * * 1', async () => {
      console.log('Generating weekly bulk feedback notifications...');
      await this.generateWeeklyBulkNotifications();
    });

    // Process overdue reminders (every 4 hours)
    this.scheduleJob('process-overdue-reminders', '0 */4 * * *', async () => {
      console.log('Processing overdue reminders...');
      await notificationService.processOverdueReminders();
    });

    // Cleanup expired notifications (daily at midnight)
    this.scheduleJob('cleanup-expired', '0 0 * * *', async () => {
      console.log('Cleaning up expired notifications...');
      await notificationService.cleanupExpiredNotifications();
    });

    // Monthly program feedback reminders (1st of every month at 11 AM)
    this.scheduleJob('monthly-program-feedback', '0 11 1 * *', async () => {
      console.log('Generating monthly program feedback reminders...');
      await this.generateMonthlyProgramFeedback();
    });

    this.isRunning = true;
    console.log('✅ Notification scheduler started successfully');
  }

  // Stop all scheduled jobs
  stopScheduler() {
    this.jobs.forEach((job, name) => {
      job.destroy();
      console.log(`Stopped job: ${name}`);
    });
    this.jobs.clear();
    this.isRunning = false;
    console.log('❌ Notification scheduler stopped');
  }

  // Schedule a custom job
  scheduleJob(name, cronPattern, jobFunction) {
    if (this.jobs.has(name)) {
      console.log(`Job ${name} already exists, skipping...`);
      return;
    }

    const job = cron.schedule(cronPattern, jobFunction, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    this.jobs.set(name, job);
    console.log(`✅ Scheduled job: ${name} with pattern: ${cronPattern}`);
  }

  // Generate daily feedback reminders for active batches
  async generateDailyFeedbackReminders() {
    try {
      const activeBatches = await AcademyBatch.findAll({
        where: { status: 'active' },
        include: [{ model: AcademyProfile, as: 'academy' }]
      });

      let totalNotifications = 0;

      for (const batch of activeBatches) {
        const result = await notificationService.generateFeedbackNotificationsForBatch(
          batch.batchId,
          {
            priority: 'medium',
            dueInHours: 24,
            reminderType: 'daily_batch_feedback'
          }
        );
        totalNotifications += result.notificationsCreated;
      }

      console.log(`✅ Daily feedback reminders generated: ${totalNotifications} notifications for ${activeBatches.length} batches`);
      
      return {
        success: true,
        totalNotifications,
        batchesProcessed: activeBatches.length
      };
    } catch (error) {
      console.error('❌ Error generating daily feedback reminders:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate weekly bulk notifications for all academies
  async generateWeeklyBulkNotifications() {
    try {
      const academies = await AcademyProfile.findAll({
        attributes: ['academyProfileId', 'name']
      });

      let totalNotifications = 0;

      for (const academy of academies) {
        const result = await notificationService.generateBulkFeedbackNotifications(
          academy.academyProfileId,
          {
            daysSinceLastFeedback: 7,
            priority: 'medium'
          }
        );
        totalNotifications += result.totalNotifications;
      }

      console.log(`✅ Weekly bulk notifications generated: ${totalNotifications} notifications for ${academies.length} academies`);
      
      return {
        success: true,
        totalNotifications,
        academiesProcessed: academies.length
      };
    } catch (error) {
      console.error('❌ Error generating weekly bulk notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate monthly program feedback reminders
  async generateMonthlyProgramFeedback() {
    try {
      const activePrograms = await AcademyProgram.findAll({
        where: { status: 'active' },
        include: [{ model: AcademyProfile, as: 'academy' }]
      });

      let totalNotifications = 0;

      for (const program of activePrograms) {
        const result = await notificationService.generateFeedbackNotificationsForProgram(
          program.programId,
          {
            priority: 'high',
            dueInHours: 72,
            reminderType: 'monthly_program_feedback'
          }
        );
        totalNotifications += result.notificationsCreated;
      }

      console.log(`✅ Monthly program feedback reminders generated: ${totalNotifications} notifications for ${activePrograms.length} programs`);
      
      return {
        success: true,
        totalNotifications,
        programsProcessed: activePrograms.length
      };
    } catch (error) {
      console.error('❌ Error generating monthly program feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Manual trigger for feedback generation
  async triggerFeedbackGeneration(type, entityId, options = {}) {
    try {
      let result;

      switch (type) {
        case 'batch':
          result = await notificationService.generateFeedbackNotificationsForBatch(entityId, options);
          break;
        case 'program':
          result = await notificationService.generateFeedbackNotificationsForProgram(entityId, options);
          break;
        case 'academy':
          result = await notificationService.generateBulkFeedbackNotifications(entityId, options);
          break;
        default:
          throw new Error(`Invalid feedback generation type: ${type}`);
      }

      console.log(`✅ Manual feedback generation completed for ${type}:${entityId}`, result);
      return result;
    } catch (error) {
      console.error(`❌ Error in manual feedback generation for ${type}:${entityId}:`, error);
      throw error;
    }
  }

  // Get scheduler status
  getSchedulerStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.jobs.keys()),
      jobCount: this.jobs.size
    };
  }

  // Schedule one-time notification
  scheduleOneTimeNotification(date, recipientId, recipientType, notificationData) {
    const cronPattern = this.dateToCronPattern(date);
    const jobName = `onetime-${Date.now()}-${recipientId}`;

    this.scheduleJob(jobName, cronPattern, async () => {
      await notificationService.createNotification(recipientId, recipientType, notificationData);
      // Remove the job after execution
      const job = this.jobs.get(jobName);
      if (job) {
        job.destroy();
        this.jobs.delete(jobName);
      }
    });

    return jobName;
  }

  // Convert date to cron pattern
  dateToCronPattern(date) {
    const d = new Date(date);
    return `${d.getMinutes()} ${d.getHours()} ${d.getDate()} ${d.getMonth() + 1} *`;
  }
}

module.exports = new SchedulerService();