
export default async function getContactFlowArn(contactFlows, flowName) {
  let contactFlowArn = '';
  
  console.log(`To find cobatct flow arn, searching for flowName : ${flowName}`);

  if (!Array.isArray(contactFlows) || contactFlows.length === 0) {
    console.log('ContactFlows is empty or not an array');
    return undefined;
  }

  contactFlows.forEach((item) => {
        if (item && item.ContactFlowSummaryList){
            item.ContactFlowSummaryList.forEach((item) => {
                if (item.Name === flowName) {
                  contactFlowArn = item.Arn;
                  console.log(`Found flow Arn : ${contactFlowArn}`);
                }
              });
        }
    }
  );

  if (!contactFlowArn) {
    console.log('Not Found Contact Flow');
    return undefined;
  }

  return contactFlowArn;

}