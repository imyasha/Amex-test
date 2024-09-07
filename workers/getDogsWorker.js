const { parentPort } = require('worker_threads');
const mockFetch = require('../utils/mockFetch');

const handleResponse = async (message) => {
  console.log(`handling request to get dogs with correlationId: ${message.correlationId}`);
  const response = await mockFetch('dogs');
  parentPort.postMessage({ response, requestId: message.requestId, correlationId: message.correlationId });
};

parentPort.on('message', async (message) => {
  await handleResponse(message);
});
