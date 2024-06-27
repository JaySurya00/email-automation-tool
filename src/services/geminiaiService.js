const process= require('process');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function labelEmail(content) {
  const prompt = `Assign subject for the following email content: ${content}. Just give me sentence and nothing else`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}

async function generateReply(to, content) {
  const prompt = `generate response for the following email content from${to} : ${content} and name of a person sending mail is ${process.env.NAME}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}

module.exports = {
  labelEmail,
  generateReply,
};
