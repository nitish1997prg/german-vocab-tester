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
  redisEval: vi.fn(),

  getPending: vi.fn(),
  getEmailHash: vi.fn(),
  refreshPendingTTL: vi.fn(),

  sendEmail: vi.fn(),
}));

// Prevent server-only from throwing outside Next.js.
vi.mock("server-only", () => ({}));

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({
      set: mocks.redisSet,
      eval: mocks.redisEval,
    }),
  },
}));

vi.mock("@/lib/auth/pending-registration", () => ({
  getPendingRegistration: mocks.getPending,
  getRegistrationEmailHash: mocks.getEmailHash,
  refreshPendingRegistrationTTL:
    mocks.refreshPendingTTL,
}));

vi.mock("@/lib/email/send-auth-email", () => ({
  sendAuthEmail: mocks.sendEmail,
}));

import {
  issueRegistrationOTP,
  verifyAndConsumeRegistrationOTP,
  REGISTRATION_OTP_TTL_SECONDS,
  REGISTRATION_OTP_COOLDOWN_SECONDS,
} from "./registration-otp";

const email = "nitish@example.com";
const emailHash = "test-email-identifier";
const secret = "unit-test-secret";

const cooldownKey =
  `auth:registration-otp-cooldown:${emailHash}`;

const otpKey =
  `auth:registration-otp:${emailHash}`;

function expectedOTPHash(
  address: string,
  code: string
): string {
  return createHmac("sha256", secret)
    .update(
      `registration:${address.trim().toLowerCase()}:${code}`
    )
    .digest("hex");
}

describe("Registration OTP", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.stubEnv("BETTER_AUTH_SECRET", secret);

    mocks.getPending.mockResolvedValue({
      firstName: "Nitish",
      lastName: "Viraktamath",
      email,
      createdAt: Date.now(),
    });

    mocks.getEmailHash.mockReturnValue(emailHash);

    mocks.refreshPendingTTL.mockResolvedValue(true);

    mocks.redisSet.mockResolvedValue("OK");

    mocks.redisEval.mockResolvedValue("verified");

    mocks.sendEmail.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("OTP issuance", () => {
    it("does not issue an OTP without pending registration", async () => {
      mocks.getPending.mockResolvedValue(null);

      const result = await issueRegistrationOTP(email);

      expect(result).toBe("missing-pending");

      expect(mocks.redisSet).not.toHaveBeenCalled();

      expect(mocks.sendEmail).not.toHaveBeenCalled();
    });

    it("enforces the 60-second resend cooldown", async () => {
      // Redis NX returns null if the cooldown key exists.
      mocks.redisSet.mockResolvedValueOnce(null);

      const result = await issueRegistrationOTP(email);

      expect(result).toBe("cooldown");

      expect(mocks.redisSet).toHaveBeenCalledWith(
        cooldownKey,
        "1",
        {
          ex: 60,
          nx: true,
        }
      );

      expect(mocks.redisSet).toHaveBeenCalledTimes(1);

      expect(mocks.sendEmail).not.toHaveBeenCalled();
    });

    it("handles pending registration disappearing before TTL refresh", async () => {
      mocks.refreshPendingTTL.mockResolvedValue(false);

      const result = await issueRegistrationOTP(email);

      expect(result).toBe("missing-pending");

      expect(mocks.sendEmail).not.toHaveBeenCalled();
    });

    it("generates a six-digit OTP and stores its HMAC hash", async () => {
      const before = Date.now();

      const result = await issueRegistrationOTP(email);

      const after = Date.now();

      expect(result).toBe("sent");

      expect(mocks.redisSet).toHaveBeenCalledTimes(2);

      // First Redis SET: cooldown.
      expect(mocks.redisSet).toHaveBeenNthCalledWith(
        1,
        cooldownKey,
        "1",
        {
          ex: REGISTRATION_OTP_COOLDOWN_SECONDS,
          nx: true,
        }
      );

      // Second Redis SET: OTP record.
      const [
        storedKey,
        storedRecord,
        storedOptions,
      ] = mocks.redisSet.mock.calls[1];

      expect(storedKey).toBe(otpKey);

      expect(storedOptions).toEqual({
        ex: REGISTRATION_OTP_TTL_SECONDS,
      });

      expect(storedRecord.attempts).toBe(0);

      expect(storedRecord.issuedAt).toBeGreaterThanOrEqual(
        before
      );

      expect(storedRecord.issuedAt).toBeLessThanOrEqual(
        after
      );

      // Extract the generated code from the mocked email.
      const sentEmail =
        mocks.sendEmail.mock.calls[0][0];

      const match = sentEmail.text.match(
        /Your registration code is: (\d{6})/
      );

      expect(match).not.toBeNull();

      const generatedCode = match![1];

      // OTP itself must not be stored in Redis.
      expect(storedRecord).not.toHaveProperty("otp");
      expect(storedRecord).not.toHaveProperty("code");

      // Only the HMAC hash should be stored.
      expect(storedRecord.codeHash).toBe(
        expectedOTPHash(email, generatedCode)
      );
    });

    it("normalizes email addresses before sending", async () => {
      await issueRegistrationOTP(
        "  NITISH@EXAMPLE.COM  "
      );

      expect(mocks.getPending).toHaveBeenCalledWith(
        "nitish@example.com"
      );

      expect(mocks.getEmailHash).toHaveBeenCalledWith(
        "nitish@example.com"
      );

      expect(mocks.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "nitish@example.com",
        })
      );
    });

    it("propagates email delivery failures", async () => {
      mocks.sendEmail.mockRejectedValue(
        new Error("Resend unavailable")
      );

      await expect(
        issueRegistrationOTP(email)
      ).rejects.toThrow("Resend unavailable");

      // The current implementation stores the OTP and
      // cooldown before attempting email delivery.
      expect(mocks.redisSet).toHaveBeenCalledTimes(2);
    });
  });

  describe("OTP verification", () => {
    it.each([
      "verified",
      "incorrect",
      "locked",
      "expired",
    ] as const)(
      "returns the Redis verification result: %s",
      async (status) => {
        mocks.redisEval.mockResolvedValue(status);

        const result =
          await verifyAndConsumeRegistrationOTP(
            email,
            "123456"
          );

        expect(result).toBe(status);
      }
    );

    it("passes the correct OTP hash and attempt limit to Redis", async () => {
      const result =
        await verifyAndConsumeRegistrationOTP(
          "  NITISH@EXAMPLE.COM ",
          "123456"
        );

      expect(result).toBe("verified");

      expect(mocks.redisEval).toHaveBeenCalledTimes(1);

      const [
        script,
        keys,
        args,
      ] = mocks.redisEval.mock.calls[0];

      expect(script).toContain(
        'redis.call("GET", KEYS[1])'
      );

      expect(script).toContain(
        'redis.call("DEL", KEYS[1])'
      );

      expect(script).toContain(
        'redis.call("PTTL", KEYS[1])'
      );

      expect(keys).toEqual([otpKey]);

      expect(args).toEqual([
        expectedOTPHash(email, "123456"),
        5,
      ]);
    });

    it("rejects unexpected Redis verification results", async () => {
      mocks.redisEval.mockResolvedValue(
        "unexpected-status"
      );

      await expect(
        verifyAndConsumeRegistrationOTP(
          email,
          "123456"
        )
      ).rejects.toThrow(
        "Unexpected OTP verification result"
      );
    });

    it("rejects verification without BETTER_AUTH_SECRET", async () => {
      vi.stubEnv("BETTER_AUTH_SECRET", "");

      await expect(
        verifyAndConsumeRegistrationOTP(
          email,
          "123456"
        )
      ).rejects.toThrow(
        "BETTER_AUTH_SECRET is missing"
      );

      expect(mocks.redisEval).not.toHaveBeenCalled();
    });
  });
});