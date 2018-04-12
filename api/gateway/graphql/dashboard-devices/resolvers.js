module.exports = {
  Query: {
    getDashBoardDevicesAlarmReport(root, args, context) {
      return context.broker
        .forwardAndGetReply$('Device','gateway.graphql.query.getDashBoardDevicesAlarmReport', { root, args, jwt: context.encodedToken },500)
        .toPromise();
    },
  },
}

