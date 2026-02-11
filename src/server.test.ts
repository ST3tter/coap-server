import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { request, type IncomingMessage } from "coap";
import { server } from "./server.ts";

const TEST_PORT = 5684;

describe("CoAP Server", () => {
  beforeAll((done) => {
    server.listen(TEST_PORT, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  test("GET / returns 2.05 with 'Hello from CoAP!'", (done) => {
    const req = request({
      hostname: "localhost",
      port: TEST_PORT,
      pathname: "/",
      method: "GET",
    });

    req.on("response", (res: IncomingMessage) => {
      expect(res.code).toBe("2.05");
      expect(res.payload.toString()).toBe("Hello from CoAP!");
      done();
    });

    req.end();
  });

  test("CON POST /temp returns 2.01", (done) => {
    const req = request({
      hostname: "localhost",
      port: TEST_PORT,
      pathname: "/temp",
      method: "POST",
      confirmable: true,
    });

    req.on("response", (res: IncomingMessage) => {
      expect(res.code).toBe("2.01");
      expect(res.payload.length).toBe(0);
      done();
    });

    req.end(Buffer.from([0x01, 0x02]));
  });

  test("NON POST /temp returns 2.01", (done) => {
    const req = request({
      hostname: "localhost",
      port: TEST_PORT,
      pathname: "/temp",
      method: "POST",
      confirmable: false,
    });

    req.on("response", (res: IncomingMessage) => {
      expect(res.code).toBe("2.01");
      expect(res.payload.length).toBe(0);
      done();
    });

    req.end(Buffer.from([0x01, 0x02]));
  });

  test("CON POST /temp-noack times out with no response", (done) => {
    let responded = false;
    const req = request({
      hostname: "localhost",
      port: TEST_PORT,
      pathname: "/temp-noack",
      method: "POST",
      confirmable: true,
    });

    req.on("response", () => {
      responded = true;
      done(new Error("Should not have received a response"));
    });

    req.on("error", () => {
      // Retries exhausted — expected behavior
      done();
    });

    // Fallback: if no error event fires within 8s, pass if no response received
    setTimeout(() => {
      if (!responded) done();
    }, 8000);

    req.end();
  }, { timeout: 10000 });
});
