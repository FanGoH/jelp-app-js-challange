module.exports = {
  friendlyName: "Availability",

  description: "Availability something.",

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

  exits: {},

  fn: async function (inputs) {
    console.log(inputs);

    // All done.
    return;
  },
};
