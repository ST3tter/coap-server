import { createServer, type IncomingMessage, type OutgoingMessage } from "coap";

export function handleRequest(req: IncomingMessage, res: OutgoingMessage): void {
  const client = (req as any).rsinfo;
  const packet = (req as any)._packet;

  const tokenHex = packet?.token ? Buffer.from(packet.token).toString("hex") : "none";
  const messageType = packet?.confirmable
    ? "CON"
    : packet?.ack
      ? "ACK"
      : packet?.reset
        ? "RST"
        : "NON";

  const headers = req.headers;
  const filteredHeaders: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined && value !== null && value !== "") {
      filteredHeaders[key] = value;
    }
  }

  console.log("--- CoAP Request ---");
  console.log(`  Method: ${req.method} ${req.url}`);
  console.log(`  Client: ${client?.address}:${client?.port} (${client?.family})`);
  console.log(`  Message ID: ${packet?.messageId} | Token: ${tokenHex} | Type: ${messageType}`);
  console.log(`  Payload: ${req.payload?.length ?? 0} bytes`);
  console.log(`  Headers: ${JSON.stringify(filteredHeaders)}`);
  console.log("---");

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
