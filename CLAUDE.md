# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Minimal CoAP (Constrained Application Protocol, RFC 7252) server built with Bun and TypeScript. Uses the `coap` npm package which provides HTTP-like API for CoAP over UDP. Default CoAP port is 5683.

## Commands

```bash
bun install                    # Install dependencies
bun run src/index.ts           # Start the CoAP server
bun test                       # Run all tests
bun test src/server.test.ts    # Run a single test file
```

Tests use `bun:test` with the `coap` client. TypeScript is type-checked only (`noEmit: true` in tsconfig).

## Architecture

Source and test files live in `src/`. Server logic is in `src/server.ts` (exports `server` and `handleRequest`), with `src/index.ts` as a thin entry point that calls `listen()`. Tests in `src/server.test.ts` start the server on port 5684 to avoid conflicts. The `/temp-noack` test has a 10s timeout due to CoAP retry exhaustion. ES module project running on Bun runtime.

## Key Technical Details

- **Runtime:** Bun (not Node.js) — use `bun` commands, not `npm`/`node`
- **Module system:** ESM (`"type": "module"`)
- **TypeScript:** Strict mode, bundler module resolution, `.ts` extension imports allowed
- **Protocol:** CoAP over UDP (not HTTP/TCP) — standard HTTP tools like curl won't work for testing; use CoAP clients
- **CoAP response codes:** Uses string codes like `"2.01"`, `"2.05"`, `"4.04"` (not HTTP-style integers)
