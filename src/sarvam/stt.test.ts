import { describe, expect, test } from "bun:test";

import {
  configureStreamingSocketForBun,
  type SttSocket,
} from "./stt.ts";

describe("Sarvam streaming transport", () => {
  test("uses a Bun-supported binary type before the socket opens", () => {
    const transport = { binaryType: "blob" };
    const socket = { socket: transport } as unknown as SttSocket;

    configureStreamingSocketForBun(socket);

    expect(transport.binaryType).toBe("arraybuffer");
  });
});
