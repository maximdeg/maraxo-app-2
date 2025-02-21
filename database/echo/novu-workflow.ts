// import { Echo } from "@novu/echo";

// export const echo = new Echo({
//    /**
//    * Enable this flag only during local development
//    * For production this should be false
//    devModeBypassAuthentication: true
//    */
//   devModeBypassAuthentication: process.env.NODE_ENV === "development",
// });

// echo.workflow(
//   "hello-world",
//   async ({ step }) => {
//     await step.chat(
//       "send-chat",
//       async () => {
//         return {
//           body: "Hello from Novu",
//         };
//       },
//       {
//         inputSchema: { // 👈 This is the input schema for the current step
//           type: "object",
//           properties: {},
//         },
//       },
//     );
//   },
//   {
//     payloadSchema: { // 👈 This is the payload schema for the whole workflow
//       type: "object",
//       properties: {}
//     }
//   },
// );
