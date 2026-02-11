import { request, type IncomingMessage } from "coap";
import type { CoapMethod } from "coap-packet";

const host = process.argv[2] || "localhost";
let failed = false;

function coapRequest(opts: {
  hostname: string;
  pathname: string;
  method: CoapMethod;
  payload?: Buffer;
}): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const req = request({
      hostname: opts.hostname,
      pathname: opts.pathname,
      method: opts.method,
    });

    req.on("response", resolve);
    req.on("error", reject);
    req.end(opts.payload);
  });
}

// GET /
console.log(`Testing CoAP server at ${host}:5683\n`);

const getRes = await coapRequest({
  hostname: host,
  pathname: "/",
  method: "GET",
});

const getPayload = getRes.payload.toString();
const getPass = getRes.code === "2.05";
if (!getPass) failed = true;
console.log(`GET /  => ${getRes.code} "${getPayload}" ${getPass ? "PASS" : "FAIL"}`);

// POST /temp
const postRes = await coapRequest({
  hostname: host,
  pathname: "/temp",
  method: "POST",
  payload: Buffer.from([0x01, 0x02]),
});

const postPass = postRes.code === "2.01";
if (!postPass) failed = true;
console.log(`POST /temp => ${postRes.code} (${postRes.payload.length} bytes) ${postPass ? "PASS" : "FAIL"}`);

if (failed) process.exit(1);
