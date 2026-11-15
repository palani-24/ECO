import { broadcastMorningWasteAlert } from './pushNotificationService.js';

let timerId = null;

/**
 * Calculates milliseconds until next 6:00:00 AM in Indian Standard Time (IST, UTC+5:30)
 */
export const getMsUntilNext6AMIST = () => {
  const now = new Date();
  
  // Calculate current time in IST
  const utcOffset = now.getTimezoneOffset() * 60000;
  const utcTime = now.getTime() + utcOffset;
  const istOffset = 5.5 * 3600000; // +5:30 in ms
  const istNow = new Date(utcTime + istOffset);

  // Target 6:00:00 AM IST
  const istTarget = new Date(istNow);
  istTarget.setHours(6, 0, 0, 0);

  // If already past 6:00 AM IST today, set for tomorrow 6:00 AM IST
  if (istNow >= istTarget) {
    istTarget.setDate(istTarget.getDate() + 1);
  }

  const diffMs = istTarget.getTime() - istNow.getTime();
  return {
    diffMs,
    targetDateIST: istTarget.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  };
};

/**
 * Schedules daily morning 6:00 AM notification loop
 */
export const startMorningWasteScheduler = () => {
  if (timerId) {
    clearTimeout(timerId);
  }

  const { diffMs, targetDateIST } = getMsUntilNext6AMIST();
  const hoursRemaining = (diffMs / 3600000).toFixed(2);

  console.log(`⏰ [Morning Waste Scheduler] Active: Next 6:00 AM IST reminder in ${hoursRemaining} hrs (At: ${targetDateIST})`);

  timerId = setTimeout(async () => {
    console.log('🌅 [Morning 6:00 AM Waste Trigger] Dispatching automated morning waste segregation alerts to all users...');
    try {
      await broadcastMorningWasteAlert({ isTest: false });
    } catch (err) {
      console.error('❌ [Morning Waste Scheduler Error]:', err);
    }
    // Reschedule for next day 6:00 AM IST
    startMorningWasteScheduler();
  }, diffMs);

  return {
    active: true,
    nextRunIST: targetDateIST,
    hoursRemaining
  };
};
