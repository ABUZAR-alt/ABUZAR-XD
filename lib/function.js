// lib/functions.js

const moment = require('moment-timezone');

function getCurrentTime() {
  return moment().tz('Asia/Karachi').format('HH:mm:ss');
}

function getGreeting() {
  const hour = moment().tz('Asia/Karachi').hour();
  if (hour < 12) return 'Good Morning 🌅';
  if (hour < 18) return 'Good Afternoon ☀️';
  return 'Good Evening 🌙';
}

module.exports = {
  getCurrentTime,
  getGreeting,
};
