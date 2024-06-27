const { Queue } = require("bullmq");
const { redisOptions } = require("../config/redisConfig.js");
const { gmail } = require("../email/gmailService.js");

const emailQueue = new Queue("emailQueue", { connection: redisOptions });

async function addEmailToQueue() {
  try{
    const emails = await gmail.fetchMessages();
    emails.forEach(async (email) => {
      await emailQueue.add("email", email, {jobId: email.id, removeOnComplete: true});
    });
  }
  catch(err){
    console.log(err);
  }

}

module.exports = { addEmailToQueue };