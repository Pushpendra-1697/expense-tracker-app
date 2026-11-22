require('dotenv').config();
const cron = require('node-cron');
const app = require('./app');
const connectDB = require('./config/db');
const { processRecurringTransactions } = require('./services/recurring');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  // Process recurring transactions every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const count = await processRecurringTransactions();
      if (count > 0) {
        console.log(`Processed ${count} recurring transaction(s)`);
      }
    } catch (err) {
      console.error('Recurring job failed:', err.message);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;
