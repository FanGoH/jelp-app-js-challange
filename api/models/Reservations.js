const dayjs = require("dayjs");

/**
 * Reservations.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    reservationId: {
      type: "string",
    },

    clientName: {
      type: "string",
      required: true,
    },

    roomNo: {
      type: "number",
      required: true,
    },

    startDate: {
      type: "string",
      required: true,
      custom: function (value) {
        return dayjs(value).isValid();
      },
    },
    endDate: {
      type: "string",
      allowNull: true,
      custom: function (value) {
        return dayjs(value).isValid();
      },
    },

    orderStatus: {
      type: "string",
      isIn: ["active", "cancelled"],
      defaultsTo: "active",
    },

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
  },

  beforeCreate: (values, proceed) => {
    const { startDate, endDate } = values;

    const startDateParsed = dayjs(startDate).toDate().toDateString();
    const endDateParsed = dayjs(endDate).toDate().toDateString();

    values = { ...values, startDate: startDateParsed, endDate: endDateParsed };

    return proceed();
  },
};
