

export default async function hopHandling(primaryHOP, hopArn, targetHOP) {
  // arn:aws:connect:us-east-1:***:instance/4bbee21d-72b8-442b-af39-dce4128ca77e/operating-hours/66d9dac1-bc4c-434e-b2b2-d0809e41eb85
    let primaryHopName;

    if (!Array.isArray(primaryHOP) || primaryHOP.length === 0) {
      console.log('primaryHOP is empty or not an array');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "HOP",
        "ResourceName": null,
        "ResourceArn": hopArn
      };
    }

    let foundhopArnInPrimary = false;
    outerLoop: // label for the outer loop
    for (const item of primaryHOP) {
        if (item && item.HoursOfOperationSummaryList) {
            for (const hop of item.HoursOfOperationSummaryList) {
                if (hop.Arn === hopArn) {
                    console.log('Found hopArn in primaryHOP');
                    primaryHopName = hop.Name;
                    console.log('primaryHopName : ', primaryHopName);
                    foundhopArnInPrimary = true;
                    break outerLoop; // break the outer loop
                }
            }
        }
    }

    if (!foundhopArnInPrimary) {
      console.log('Not Found hopArn in primaryHOP');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "HOP",
        "ResourceName": primaryHopName,
        "ResourceArn": hopArn
      };;
    } 
    
    if (!Array.isArray(targetHOP) || targetHOP.length === 0) {
      console.log('targetHOP is empty or not an array');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "HOP",
        "ResourceName": primaryHopName,
        "ResourceArn": hopArn
      };
    }

    let foundHopArnInTarget = false;
    let targetHopArn;
    outerLoop: // label for the outer loop
    for (const item of targetHOP) {
        if (item && item.HoursOfOperationSummaryList) {
            for (const hop of item.HoursOfOperationSummaryList) {
                const targetHopName = hop.Name;
                // console.log('targetHopName : ', targetHopName);
                if (targetHopName === primaryHopName) {
                    console.log('Found hopArn in targetHOP');
                    foundHopArnInTarget = true;
                    targetHopArn = hop.Arn;
                    break outerLoop; // break the outer loop
                }
            }
        }
    }

    if (!foundHopArnInTarget) {
      console.log('Not Found hopArn in targetHOP ');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "HOP",
        "ResourceName": primaryHopName,
        "ResourceArn": hopArn
      };
    } else {
      return {
        "ResourceStatus": "exists",
        "ResourceArn": targetHopArn
      };
    } 

}