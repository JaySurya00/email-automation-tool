const process= require('process');
const { addEmailToQueue } = require("./bullmq/bullQueue.js");
require('./bullmq/emailWorkers.js');

setInterval(async () => {
  addEmailToQueue();

}, process.env.INTERVAL);
