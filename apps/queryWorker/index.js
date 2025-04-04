const {
  connectQueryRunnerJobResultProducer,
  listenQueryRunnerJobs,
  disconnectQueryRunnerJobResultProducer,
} = require("./config/broker");
const Logger = require("./utils/logger");

async function startBroker() {
  try {
    await connectQueryRunnerJobResultProducer();
    await listenQueryRunnerJobs();
    Logger.log('success', {message:'Broker started successfully.'});
  } catch (error) {
    Logger.log('error', { message: 'Broker start failed.', params: { error } });
    await disconnectQueryRunnerJobResultProducer();
    process.exit(1);
  }
}

startBroker();
