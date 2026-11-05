const cron = require('node-cron');
const clusteringPipeline = require('../services/clusteringPipeline');

let cronJob = null;

const initCronJobs = () => {
  // Run news collection & clustering every hour by default, or disable if desired
  const schedule = process.env.NEWS_CRON_SCHEDULE || '0 * * * *';

  cronJob = cron.schedule(schedule, async () => {
    console.log('⏰ Scheduled CrossView news intelligence collection trigger...');
    try {
      await clusteringPipeline.runPipeline();
    } catch (err) {
      console.error('Scheduled news collection failed:', err);
    }
  });

  console.log(`⏱️ News intelligence cron schedule initialized: ${schedule}`);
};

const stopCronJobs = () => {
  if (cronJob) {
    cronJob.stop();
  }
};

module.exports = { initCronJobs, stopCronJobs };

