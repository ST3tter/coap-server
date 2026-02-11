import { server } from "./server.ts";

server.listen(() => {
  console.log("CoAP server listening on port 5683");
});
