## Identify and fix the issue with getCatsInfo API

### Summary:
The getCatsInfo API works fine for the first few requests, but after a few requests, it stops responding. Your task is to identify the root cause of this issue and implement a fix. Additionally, you should document the reason for the issue and the fix applied in the README.md file,along with list of files changed. I've fixed this issue.

### Changes Made:

1. **getCatsWorker.js**:
   - The function refreshToken contained type error. It was `data.value.key` but it should be `data.key`.


### Acceptance Criteria:
- The getCatsInfo API works without any issues for any number of requests.
- 


## Add correlationId header to all the requests and response

### Summary:
We have implemented correlation ID support for all incoming requests and outgoing responses. This ensures that every request can be tracked through the system using a `correlationId`.

### Changes Made:

1. **server.js**:
   - Added middleware to check for a `correlationId` header in incoming requests. If not present, it generates a new correlation ID and ensures the `correlationId` is added to the response headers.

2. **getCatsWorker.js**:
   - The worker now processes the `correlationId` and includes it in the messages back to the main thread.

3. **getDogsWorker.js**:
   - Similar to `getCatsWorker.js`, this worker also handles and passes the `correlationId`.

### Acceptance Criteria:
- All requests and responses contain a `correlationId` header.
- If the `correlationId` is provided by the client, that value will be used. If not, a new ID is generated.
