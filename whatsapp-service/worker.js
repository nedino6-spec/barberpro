const { Worker } = require("bullmq");
const { PrismaClient } = require("@prisma/client");
const { google } = require("googleapis");
const Redis = require("ioredis");

const prisma = new PrismaClient();
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisConnection = new Redis(redisUrl, { maxRetriesPerRequest: null });

function getCalendarClient(accessToken, refreshToken) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
  return google.calendar({ version: "v3", auth: client });
}

// Worker disabled locally to prevent Redis ECONNREFUSED spam
module.exports = {};
