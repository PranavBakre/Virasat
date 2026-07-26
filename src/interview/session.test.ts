import { expect, test } from "bun:test";
import { isCurrentGeneration } from "./session.ts";

test("a reset invalidates an in-flight extraction generation", () => {
  expect(isCurrentGeneration(3, 3)).toBeTrue();
  expect(isCurrentGeneration(3, 4)).toBeFalse();
});
