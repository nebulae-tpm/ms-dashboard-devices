module.exports = {
  Query: {
    DashBoardDevicesTest(root, args, context) {
      return context.broker
        .forwardAndGetReply$('dashboard-devices', { root, args, jwt: {} })
        .toPromise();
    },
  },
  Mutation: {
    createDashBoardDevicesTest: (root, args) => { return { id: 5, firstName: args.firstName, lastName: args.lastName }; },
  },
}

