const dayjs = require("dayjs");

module.exports = async function (req, res, proceed) {
  const { startDate, endDate } = req.body;

  if (dayjs(endDate).diff(dayjs(startDate), "day") >= 0) {
    return proceed();
  } else {
    res.badRequest("The endDate should be after or the same as startDate");
  }
};
