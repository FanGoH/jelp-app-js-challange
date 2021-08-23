const dayjs = require("dayjs");

const getAfterIncrementDateString = (startDate, increment) =>
  dayjs(startDate).add(increment, "days").toDate().toDateString();

const getRandomInt = (start, limit) =>
  Math.floor(Math.random() * (limit - start + 1)) + start;

const getRandomPickForArray = (array) =>
  array[getRandomInt(0, array.length - 1)];

module.exports = {
  getAfterIncrementDateString,
  getRandomInt,
  getRandomPickForArray,
};
