const process= require('process');
const { google } = require("googleapis");
const { GoogleAuth } = require("../auth/googleAuth");
const Buffer = require("buffer").Buffer;

class Gmail {
  constructor() {}
  async initializeClient() {
    const client = await GoogleAuth();
    this.gmail = google.gmail({ version: "v1", auth: client });
  }
  async fetchMessages() {
    const now = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
    const twoHoursAgo = now - 5 * 60 * 60; //
    try {
      const res = await this.gmail.users.messages.list({
        userId: "me",
        q: `after:${twoHoursAgo} category:primary is:unread`,
      });
      const messages = res.data.messages || [];
      if (messages.length === 0) {
        console.log("No new messages");
      }
      return messages;
    } catch (err) {
      console.log("API returned an error", err);
      return null;
    }
  }

  async getMessageContent(messageId) {
    try {
      const msg = await this.gmail.users.messages.get({
        userId: "me",
        id: messageId,
      });
      const payload = msg.data.payload;
      const headers = payload.headers;
      const subject = headers.find((header) => header.name === "Subject").value;
      const from = headers.find((header) => header.name === "From").value;
      let body = "";
      if (payload.parts) {
        for (let part of payload.parts) {
          if (part.mimeType === "text/plain") {
            body = Buffer.from(part.body.data, "base64").toString("utf-8");
          }
        }
      }
      return { from, subject, body };
    } catch (err) {
      console.log("Error while getting msg content", err);
      return null;
    }
  }

  async markEmailAsRead(messageId) {
    await this.gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    });
  }

  async sendMail(emailAddress, subject, replyContent) {
    try {
      const email = [
        `From: ${process.env.EMAIL}`,
        `To: ${emailAddress}`,
        `Subject: ${subject}`,
        "",
        replyContent,
      ].join("\n");

      const encodedMessage = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

      await this.gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
        },
      });
      return email;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

const gmail = new Gmail();
gmail.initializeClient();

module.exports = { gmail };
