const { parentPort } = require('worker_threads');
const mockFetch = require('../utils/mockFetch');
const cachedTokensMap = new Map();

const refreshToken = async (data) => {
  try {
    const refreshedToken = await invokeTokenService(data.key);
    cachedTokensMap.set(data.key, { token: refreshedToken });
  } catch (error) {
    throw error;
  }
};

const invokeTokenService = async (key) => {
  return `${key}-${Date.now()}`;
};

const generateToken = async (data) => {
  if (!cachedTokensMap.has(data.key)) {
    const token = await invokeTokenService(data.key);
    cachedTokensMap.set(data.key, { token });
    setTimeout(() => refreshToken(data), 5000);
    return token;
  } else {
    return cachedTokensMap.get(data.key).token;
  }
};

const handleMessage = async (data) => {
  console.log(`handling request to get cats with correlationId: ${data.correlationId}`);
  const token = await generateToken({
    key: 'token-key'
  });
  const response = await mockFetch('cats', token);
  return response;
};

parentPort.on('message', async (message) => {
  try {
    const response = await handleMessage(message);
    parentPort.postMessage({ response, requestId: message.requestId, correlationId: message.correlationId });
  } catch (error) {
    console.log('handleResponse error:', error);
    parentPort.postMessage({ response: 'error response from worker', requestId: message.requestId, correlationId: message.correlationId });
  }
});
