const dayjs = require("dayjs");
const { verifyAvailability } = require("../services/verifyAvailability");
const { isDateRangeOverlapping } = require("../services/helpers");

module.exports = {
  friendlyName: "Availability",

  description:
    "Check room Availability based on date, returns an array of rooms.",

  inputs: {
    startDate: {
      description: "The day that the guest wants to start the reservation",
      type: "string",
      required: true,
    },
    endDate: {
      description: "The day that the guest wants to end the reservation",
      type: "string",
      required: true,
    },
  },

  exits: {
    badInputs: {
      description: "The dates must be parseable by dayjs or native date.",
      responseType: "badRequest",
    },
  },

  fn: async function ({ startDate, endDate }) {
    const startDayObj = dayjs(startDate);
    const endDayObj = dayjs(endDate);

    if (!(startDayObj.isValid() && endDayObj.isValid())) {
      throw "badInputs";
    }

    const parsedStartDate = startDayObj.toDate().toDateString();
    const parsedEndDate = endDayObj.toDate().toDateString();

    const records = await Reservations.find({ orderStatus: "active" });

    const recordsThatOverlap = records.filter((record) =>
      isDateRangeOverlapping(record, {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      })
    );

    const availability = verifyAvailability(
      recordsThatOverlap,
      { startDate: parsedStartDate, endDate: parsedEndDate },
      sails.config.custom.noOfRooms
    );

    return availability;
  },
};
