import AWS from 'aws-sdk';
const connect = new AWS.Connect();


// Helper function to handle listing resources with pagination
export async function listResourcesWithPagination(params, resourceType) {
    const resources = [];
    let response = await connect[`list${resourceType}`](params).promise();
    resources.push(response);
    
    while (response.NextToken) {
      params.NextToken = response.NextToken;
      response = await connect[`list${resourceType}`](params).promise();
      resources.push(response);
    }
    return resources;
  }
  
  // Helper function to handle throttling
 export async function listResourcesFunc(params, retryAttempts, resourceType) {
    try {
      let doRetry = false;
      do {
        doRetry = false;
        try {
          const listResources = await listResourcesWithPagination(params, resourceType);
          if (listResources) {
            return listResources;
          } else {
            return null;
          }
        } catch (error) {
          console.log('error:', error);
          if (error.code === 'TooManyRequestsException' && (retryAttempts || 5) > 0) {
            await sleep(parseInt(2500, 10) || 1000);
            --retryAttempts;
            doRetry = true;
            console.log('doRetry:', doRetry);
          } else {
            return error;
          }
        }
      } while (doRetry);
    } catch (error) {
      console.log('error:', error);
      return error;
    }
  };
  
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
