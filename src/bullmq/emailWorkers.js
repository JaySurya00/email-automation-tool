const fs = require("node:fs/promises");
const process = require("process");
const path = require("path");
const { Worker } = require("bullmq");
const { redisOptions } = require("../config/redisConfig.js");
const { gmail } = require("../email/gmailService.js");
const { generateReply, labelEmail } = require("../services/geminiaiService.js");

const LOG_PATH = path.join(process.cwd(), "messageLog.txt");

const worker = new Worker(
  "emailQueue",
  async (job) => {
    if (job) {
      try {
        const msgId = job.data.id;
        console.log(msgId);
        const {
          from: to,
          subject,
          body,
        } = await gmail.getMessageContent(msgId);
        const replyMsg = await generateReply(to, body);
        const replySub = await labelEmail(replyMsg);
        const sentMsg = await gmail.sendMail(to, replySub, replyMsg);
        await gmail.markEmailAsRead(msgId);
        fs.appendFile(LOG_PATH, JSON.stringify(sentMsg) + "\n");
        console.log(`Email sent to ${to}`);
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log("No Job in the Queue");
    }
  },
  { connection: redisOptions, removeOnComplete: true }
);
