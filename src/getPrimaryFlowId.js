


export default async function getPrimaryFlowId(primaryContactFlows, flowName) {
  let primaryFlowArn = '';
  
  console.log(`To find primary flow arn, searching for flowName : ${flowName}`);

  if (!Array.isArray(primaryContactFlows) || primaryContactFlows.length === 0) {
    console.log('primaryContactFlows is empty or not an array');
    return undefined;
  }

  primaryContactFlows.forEach((item) => {
        if (item && item.ContactFlowSummaryList){
            item.ContactFlowSummaryList.forEach((item) => {
                if (item.Name === flowName) {
                    primaryFlowArn = item.Arn;
                    console.log(`Found flow Arn : ${primaryFlowArn}`);
                }
              });
        }
    }
  );

  if (!primaryFlowArn) {
    console.log('Not Found Primary Contact Flow');
    return undefined;
  }

  return primaryFlowArn;

}