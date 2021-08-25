const dayjs = require("dayjs");

module.exports = async function (req, res, next) {
  const { startDate, endDate } = req.body;

  if (!(dayjs(startDate).isValid() && dayjs(endDate).isValid())) {
    res.badRequest("The date formats are invalid");
    return;
  }

  next();
};
