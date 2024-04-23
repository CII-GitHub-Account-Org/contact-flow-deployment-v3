

export default async function queueHandling(primaryQueues, queueArn, targetQueues) {

    let primaryQueueName;
    // console.log('primaryQueueName : ', primaryQueueName);

    if (!Array.isArray(primaryQueues) || primaryQueues.length === 0) {
      console.log('primaryQueues is empty or not an array');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "Queue",
        "ResourceName": null,
        "ResourceArn": queueArn
      };
    }

    let foundQueueArnInPrimary = false;
    outerLoop: // label for the outer loop
    for (const item of primaryQueues) {
        if (item && item.QueueSummaryList) {
            for (const Queues of item.QueueSummaryList) {
                if (Queues.Arn === queueArn) {
                    console.log('Found queueArn in primaryQueues');
                    foundQueueArnInPrimary = true;
                    primaryQueueName = Queues.Name;
                    break outerLoop; // break the outer loop
                }
            }
        }
    }

    if (!foundQueueArnInPrimary) {
      console.log('Not Found queueArn in primaryQueues');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "Queue",
        "ResourceName": primaryQueueName,
        "ResourceArn": queueArn
      };;
    } 
    
    if (!Array.isArray(targetQueues) || targetQueues.length === 0) {
      console.log('targetQueues is empty or not an array');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "Queue",
        "ResourceName": primaryQueueName,
        "ResourceArn": queueArn
      };
    }

    let foundQueueArnInTarget = false;
    let targetQueueArn;
    outerLoop: // label for the outer loop
    for (const item of targetQueues) {
        if (item && item.QueueSummaryList) {
            for (const Queues of item.QueueSummaryList) {
                const targetQueueName = Queues.Name;
                console.log('targetQueueName : ', targetQueueName);
                if (targetQueueName === primaryQueueName) {
                    console.log('Found queueArn in targetQueues');
                    foundQueueArnInTarget = true;
                    targetQueueArn = Queues.Arn;
                    break outerLoop; // break the outer loop
                }
            }
        }
    }

    if (!foundQueueArnInTarget) {
      console.log('Not Found queueArn in targetQueues');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "Queue",
        "ResourceName": primaryQueueName,
        "ResourceArn": queueArn
      };
    } else {
      return {
        "ResourceStatus": "exists",
        "ResourceArn": targetQueueArn
      };
    } 

}
