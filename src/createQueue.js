import AWS from 'aws-sdk';
const connect = new AWS.Connect();
const INSTANCEARN = process.env.SOURCE_INSTANCEARN;
const TRAGETINSTANCEARN = process.env.TRAGET_INSTANCEARN;
let FLOWNAME = process.env.FLOWNAME;
let CONTACTFLOWTYPE = process.env.CONTACTFLOWTYPE;
const REGION = process.env.REGION;
const RETRY_ATTEMPTS = process.env.RETRY_ATTEMPTS;

import { ConnectClient, DescribeQueueCommand } from "@aws-sdk/client-connect"; // ES Modules import
// const { ConnectClient, DescribeQueueCommand } = require("@aws-sdk/client-connect"); // CommonJS import
const config = {
    region: 'us-east-1', // replace with your AWS region
  };
const client = new ConnectClient(config);
const input = { // DescribeQueueRequest
  InstanceId: INSTANCEARN, // required
  QueueId: "0df4ab6f-284e-4e29-8ebe-ff35424164c9", // required
};
const command = new DescribeQueueCommand(input);
const response = await client.send(command);
console.log("response",response); 

// { // DescribeQueueResponse
//   Queue: { // Queue
//     Name: "STRING_VALUE",
//     QueueArn: "STRING_VALUE",
//     QueueId: "STRING_VALUE",
//     Description: "STRING_VALUE",
//     OutboundCallerConfig: { // OutboundCallerConfig
//       OutboundCallerIdName: "STRING_VALUE",
//       OutboundCallerIdNumberId: "STRING_VALUE",
//       OutboundFlowId: "STRING_VALUE",
//     },
//     HoursOfOperationId: "STRING_VALUE",
//     MaxContacts: Number("int"),
//     Status: "ENABLED" || "DISABLED",
//     Tags: { // TagMap
//       "<keys>": "STRING_VALUE",
//     },
//     LastModifiedTime: new Date("TIMESTAMP"),
//     LastModifiedRegion: "STRING_VALUE",
//   },
// };







// function createQueue(){
//     var params = {
//         HoursOfOperationId: 'STRING_VALUE', /* required */
//         InstanceId: 'STRING_VALUE', /* required */
//         Name: 'STRING_VALUE', /* required */
//         Description: 'STRING_VALUE',
//         MaxContacts: 'NUMBER_VALUE',
//         OutboundCallerConfig: {
//           OutboundCallerIdName: 'STRING_VALUE',
//           OutboundCallerIdNumberId: 'STRING_VALUE',
//           OutboundFlowId: 'STRING_VALUE'
//         },
//         QuickConnectIds: [
//           'STRING_VALUE',
//           /* more items */
//         ],
//         Tags: {
//           '<TagKey>': 'STRING_VALUE',
//           /* '<TagKey>': ... */
//         }
//       };
//       connect.createQueue(params, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else     console.log(data);           // successful response
//       });
// }






