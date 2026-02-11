import { createServer, type IncomingMessage, type OutgoingMessage } from "coap";

export function handleRequest(req: IncomingMessage, res: OutgoingMessage): void {
  console.log(`${req.method} ${req.url}`);

  if (req.method === "GET" && req.url === "/") {
    res.end("Hello from CoAP!");
    return;
  }

  if (req.method === "POST" && req.url === "/temp") {
    res.code = "2.01";
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/temp-noack") {
    // Suppress automatic ACK for CON requests
    if ((res as any)._ackTimer) {
      clearTimeout((res as any)._ackTimer);
      (res as any)._ackTimer = null;
    }
    // Don't call res.end() — no response or ACK is sent
    return;
  }

  res.code = "4.04";
  res.end("Not Found");
}

export const server = createServer(handleRequest);
