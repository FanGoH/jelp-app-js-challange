const { nanoid } = require("nanoid");
const dayjs = require("dayjs");
const { verifyAvailability } = require("../../services/verifyAvailability");
const {
  getRandomPickForArray,
  isDateRangeOverlapping,
} = require("../../services/helpers");

module.exports = {
  friendlyName: "Create",

  description: "Create reservations.",

  inputs: {
    clientName: {
      description: "Name of the client wanting to make the reservation",
      type: "string",
      required: true,
    },
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
    noRoomAvailable: {
      description: "There are no rooms available for this range of dates.",
      statusCode: 409,
    },
  },

  fn: async function (inputs) {
    const { startDate, endDate } = inputs;

    const parsedStartDate = dayjs(startDate).toDate().toDateString();
    const parsedEndDate = dayjs(endDate).toDate().toDateString();

    const records = await Reservations.find({ orderStatus: "active" });

    const recordsThatOverlap = records.filter((record) =>
      isDateRangeOverlapping(record, {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      })
    );

    const roomsAvailable = verifyAvailability(
      recordsThatOverlap,
      {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
      sails.config.custom.noOfRooms
    );

    if (roomsAvailable.length === 0) {
      throw {
        noRoomAvailable: `There are no rooms available for the range ${parsedStartDate} - ${parsedEndDate}, try with another date range`,
      };
    }

    const newReservation = {
      reservationId: nanoid(5),
      clientName: inputs.clientName,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      roomNo: getRandomPickForArray(roomsAvailable),
    };

    const reservationInstance = await Reservations.create(
      newReservation
    ).fetch();

    // All done.
    return reservationInstance;
  },
};
