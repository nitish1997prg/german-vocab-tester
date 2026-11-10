import { createHmac } from "node:crypto";

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  redisSet: vi.fn(),
  redisGet: vi.fn(),
  redisExpire: vi.fn(),
  redisDel: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({
      set: mocks.redisSet,
      get: mocks.redisGet,
      expire: mocks.redisExpire,
      del: mocks.redisDel,
    }),
  },
}));

import {
  getRegistrationEmailHash,
  savePendingRegistration,
  getPendingRegistration,
  refreshPendingRegistrationTTL,
  clearPendingRegistration,
  PENDING_REGISTRATION_TTL_SECONDS,
} from "./pending-registration";

const secret = "unit-test-secret";
const email = "nitish@example.com";

const expectedHash = createHmac("sha256", secret)
  .update(email)
  .digest("hex");

const expectedKey =
  `auth:pending-registration:${expectedHash}`;

const pendingRegistration = {
  firstName: "Nitish",
  lastName: "Viraktamath",
  email,
  createdAt: 123456789,
};

describe("Pending registration", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.stubEnv("BETTER_AUTH_SECRET", secret);

    mocks.redisSet.mockResolvedValue("OK");
    mocks.redisGet.mockResolvedValue(null);
    mocks.redisExpire.mockResolvedValue(1);
    mocks.redisDel.mockResolvedValue(1);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("Email hashing", () => {
    it("normalizes emails before generating the HMAC hash", () => {
      const hash = getRegistrationEmailHash(
        "  NITISH@EXAMPLE.COM  "
      );

      expect(hash).toBe(expectedHash);

      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("throws when BETTER_AUTH_SECRET is missing", () => {
      vi.stubEnv("BETTER_AUTH_SECRET", "");

      expect(() =>
        getRegistrationEmailHash(email)
      ).toThrow("BETTER_AUTH_SECRET is missing");
    });
  });

  describe("Saving pending registrations", () => {
    it("normalizes registration data and sets a five-minute TTL", async () => {
      const before = Date.now();

      const result = await savePendingRegistration({
        firstName: "  Nitish  ",
        lastName: "  Viraktamath  ",
        email: "  NITISH@EXAMPLE.COM  ",
      });

      const after = Date.now();

      expect(result).toBe(true);

      expect(mocks.redisSet).toHaveBeenCalledTimes(1);

      const [
        storedKey,
        storedRecord,
        options,
      ] = mocks.redisSet.mock.calls[0];

      expect(storedKey).toBe(expectedKey);

      expect(storedRecord).toMatchObject({
        firstName: "Nitish",
        lastName: "Viraktamath",
        email: "nitish@example.com",
      });

      expect(storedRecord.createdAt).toBeGreaterThanOrEqual(
        before
      );

      expect(storedRecord.createdAt).toBeLessThanOrEqual(
        after
      );

      expect(options).toEqual({
        ex: PENDING_REGISTRATION_TTL_SECONDS,
        nx: true,
      });

      expect(PENDING_REGISTRATION_TTL_SECONDS).toBe(
        300
      );
    });

    it("accepts a missing last name", async () => {
      await savePendingRegistration({
        firstName: "Nitish",
        email,
      });

      expect(mocks.redisSet).toHaveBeenCalledWith(
        expectedKey,
        expect.objectContaining({
          firstName: "Nitish",
          lastName: null,
          email,
        }),
        expect.anything()
      );
    });

    it("converts a blank last name to null", async () => {
      await savePendingRegistration({
        firstName: "Nitish",
        lastName: "   ",
        email,
      });

      expect(mocks.redisSet).toHaveBeenCalledWith(
        expectedKey,
        expect.objectContaining({
          lastName: null,
        }),
        expect.anything()
      );
    });

    it("prevents overwriting an existing pending registration", async () => {
      mocks.redisSet
        .mockResolvedValueOnce("OK")
        .mockResolvedValueOnce(null);

      const input = {
        firstName: "Nitish",
        lastName: "Viraktamath",
        email,
      };

      const first = await savePendingRegistration(input);

      const second = await savePendingRegistration(input);

      expect(first).toBe(true);
      expect(second).toBe(false);

      expect(mocks.redisSet).toHaveBeenCalledTimes(2);

      // Both writes must use NX.
      expect(mocks.redisSet.mock.calls[0][2]).toEqual({
        ex: 300,
        nx: true,
      });

      expect(mocks.redisSet.mock.calls[1][2]).toEqual({
        ex: 300,
        nx: true,
      });
    });

    it("propagates Redis storage errors", async () => {
      mocks.redisSet.mockRejectedValue(
        new Error("Redis unavailable")
      );

      await expect(
        savePendingRegistration({
          firstName: "Nitish",
          email,
        })
      ).rejects.toThrow("Redis unavailable");
    });
  });

  describe("Reading pending registrations", () => {
    it("returns a pending registration when it exists", async () => {
      mocks.redisGet.mockResolvedValue(
        pendingRegistration
      );

      const result = await getPendingRegistration(email);

      expect(result).toEqual(pendingRegistration);

      expect(mocks.redisGet).toHaveBeenCalledWith(
        expectedKey
      );
    });

    it("returns null when registration does not exist", async () => {
      mocks.redisGet.mockResolvedValue(null);

      const result = await getPendingRegistration(email);

      expect(result).toBeNull();
    });

    it("uses the same Redis key regardless of email casing", async () => {
      await getPendingRegistration(
        "  NITISH@EXAMPLE.COM "
      );

      expect(mocks.redisGet).toHaveBeenCalledWith(
        expectedKey
      );

      // The plaintext email should not appear in the key.
      const actualKey = mocks.redisGet.mock.calls[0][0];

      expect(actualKey).not.toContain(email);
    });
  });

  describe("TTL refresh", () => {
    it("refreshes an existing registration to 300 seconds", async () => {
      mocks.redisExpire.mockResolvedValue(1);

      const result =
        await refreshPendingRegistrationTTL(email);

      expect(result).toBe(true);

      expect(mocks.redisExpire).toHaveBeenCalledWith(
        expectedKey,
        300
      );
    });

    it("returns false when the registration key no longer exists", async () => {
      mocks.redisExpire.mockResolvedValue(0);

      const result =
        await refreshPendingRegistrationTTL(email);

      expect(result).toBe(false);
    });
  });

  describe("Cleanup", () => {
    it("deletes the pending registration key", async () => {
      await clearPendingRegistration(email);

      expect(mocks.redisDel).toHaveBeenCalledWith(
        expectedKey
      );
    });
  });
});