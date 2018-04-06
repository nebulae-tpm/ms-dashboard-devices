module.exports = {
  Query: {
    DashBoardDevicesTest(root, args, context) {
      return context.broker
        .forwardAndGetReply$('Device','gateway.graphql.Query.DashBoardDevicesTest', { root, args, jwt: {} },2000)
        .toPromise();
    },
  },
  Mutation: {
    createDashBoardDevicesTest: (root, args) => { return { id: 5, firstName: args.firstName, lastName: args.lastName }; },
  },
}

