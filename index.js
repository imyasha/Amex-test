const fastify = require('fastify')({ logger: true, connectionTimeout: 5000 });
const { getOrCreateWorker } = require('./utils/generateNewWorker');
const requestTracker = require('./utils/requestTracker');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

// Middleware to add or reuse correlationId in request
fastify.addHook('onRequest', (request, reply, done) => {
  const correlationId = request.headers['correlationid'] || uuidv4(); // Use existing or generate new
  request.headers['correlationid'] = correlationId; // Ensure it's in the request headers
  reply.header('correlationid', correlationId); // Add it to the response headers
  done();
});

fastify.get('/getCatsInfo', function handler(request, reply) {
  const getCatsWorker = getOrCreateWorker('getCatsWorker'); // Create/reuse worker
  requestTracker[request.id] = (result) => reply.send(result);
  getCatsWorker.postMessage({ requestId: request.id, correlationId: request.headers['correlationid'] });
});

fastify.get('/getDogsInfo', function handler(request, reply) {
  const getDogsWorker = getOrCreateWorker('getDogsWorker'); // Create/reuse worker
  requestTracker[request.id] = (result) => reply.send(result);
  getDogsWorker.postMessage({ requestId: request.id, correlationId: request.headers['correlationid'] });
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
