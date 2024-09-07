const { Worker } = require('worker_threads');
const path = require('path');
const requestTracker = require('./requestTracker');

const idleTimeout = 15 * 60 * 1000; // 15 minutes in milliseconds

const workers = {}; // Store workers and their idle timers

const generateNewWorker = (workerName) => {
  let worker = new Worker(path.join(__dirname, '../workers', workerName));

  console.log(`${workerName} created`);

  worker.on('message', (data) => {
    const { response, requestId } = data;
    requestTracker[requestId](response);
    delete requestTracker[requestId];

    // Reset the idle timer after processing a request
    resetWorkerIdleTimer(workerName, worker);
  });

  worker.on('error', () => {
    worker.terminate();
  });

  workers[workerName] = { worker, idleTimer: null };

  // Start the idle timer after worker is created
  resetWorkerIdleTimer(workerName, worker);

  return worker;
};

const resetWorkerIdleTimer = (workerName, worker) => {
  // Clear existing idle timer if any
  if (workers[workerName].idleTimer) {
    clearTimeout(workers[workerName].idleTimer);
  }

  // Set a new idle timer for 15 minutes
  workers[workerName].idleTimer = setTimeout(() => {
    console.log(`${workerName} terminated due to inactivity.`);
    worker.terminate();
    delete workers[workerName]; // Remove worker from memory after termination
  }, idleTimeout);
};

// Function to return existing worker or create a new one if it's terminated
const getOrCreateWorker = (workerName) => {
  if (!workers[workerName] || workers[workerName].worker.threadId === undefined) {
    console.log(`Recreating ${workerName} as it was terminated.`);
    return generateNewWorker(workerName);
  }
  return workers[workerName].worker;
};

module.exports = { generateNewWorker, getOrCreateWorker };
