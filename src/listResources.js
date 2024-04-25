import AWS from 'aws-sdk';
let connect = new AWS.Connect();

  // Helper function to handle throttling
  export async function listResourcesFunc(params, retryAttempts, resourceType, regionToUse) {
    AWS.config.update({regionToUse}); // replace with your region
    connect = new AWS.Connect();
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
            if (error.code === 'TooManyRequestsException' && (retryAttempts || 3) > 0) {
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


// Helper function to handle listing resources with pagination
async function listResourcesWithPagination(params, resourceType) {
    const resources = [];
    console.log('params:', params);
    let response = await connect[`list${resourceType}`](params).promise();
    resources.push(response);
    
    while (response.NextToken) {
      params.NextToken = response.NextToken;
      console.log('params2:', params);
      response = await connect[`list${resourceType}`](params).promise();
      resources.push(response);
    }
    return resources;
  }
  
  
  // Helper function to sleep for a given number of milliseconds
  function sleep(ms) { 
    return new Promise(resolve => setTimeout(resolve, ms));
  }
