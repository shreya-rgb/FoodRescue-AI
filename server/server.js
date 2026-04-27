require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const { startCronJobs } = require('./src/jobs/expiryChecker');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 FoodRescue server running on port ${PORT}`);
    startCronJobs();
  });
}).catch((err) => {
  console.error('Failed to connect to DB:', err);
  process.exit(1);
});
