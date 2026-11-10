import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

// Shared mock functions.
// vi.hoisted makes these available to vi.mock factories.
const mocks = vi.hoisted(() => ({
  getPending: vi.fn(),
  verifyOTP: vi.fn(),
  clearPending: vi.fn(),

  createUser: vi.fn(),
  createSession: vi.fn(),
  setSessionCookie: vi.fn(),
}));

// Mock Better Auth endpoint creation.
// Return the handler directly so tests can invoke it
// without starting an HTTP server.
vi.mock("better-auth/api", () => ({
  createAuthEndpoint: (
    _path: string,
    _options: unknown,
    handler: unknown
  ) => handler,

  APIError: class extends Error {
    status: string;

    constructor(
      status: string,
      options: { message: string }
    ) {
      super(options.message);
      this.status = status;
    }
  },
}));

vi.mock("better-auth/cookies", () => ({
  setSessionCookie: mocks.setSessionCookie,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      create: mocks.createUser,
    },
  },
}));

vi.mock("@/lib/auth/pending-registration", () => ({
  getPendingRegistration: mocks.getPending,
  clearPendingRegistration: mocks.clearPending,
}));

vi.mock("@/lib/auth/registration-otp", () => ({
  verifyAndConsumeRegistrationOTP: mocks.verifyOTP,
}));

import { registrationSessionPlugin } from "./registration-session";

const testEmail = "nitish-test@example.com";

const pendingRegistration = {
  firstName: "Nitish",
  lastName: "Viraktamath",
  email: testEmail,
  createdAt: Date.now(),
};

const testUser = {
  id: "test-user-id",
  name: "Nitish Viraktamath",
  firstName: "Nitish",
  lastName: "Viraktamath",
  email: testEmail,
  emailVerified: true,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const testSession = {
  id: "test-session-id",
  userId: testUser.id,
  token: "test-secret-session-token",
  createdAt: new Date(),
  updatedAt: new Date(),
  expiresAt: new Date(Date.now() + 86_400_000),
};

type RegistrationBody = {
  flow: string;
  email: string;
  code: string;
};

// Invoke the plugin endpoint's handler directly.
// createAuthEndpoint is mocked above.
function invokeRegistration(
  overrides: Partial<RegistrationBody> = {}
) {
  const ctx = {
    body: {
      flow: "registration",
      email: testEmail,
      code: "123456",
      ...overrides,
    },

    context: {
      internalAdapter: {
        createSession: mocks.createSession,
      },
    },

    json: (body: unknown) => body,
  };

  const endpoint =
    registrationSessionPlugin().endpoints.completeRegistration;

  const handler = endpoint as unknown as (
    context: typeof ctx
  ) => Promise<unknown>;

  return handler(ctx);
}

describe("Registration session plugin", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mocks.getPending.mockResolvedValue(
      pendingRegistration
    );

    mocks.verifyOTP.mockResolvedValue("verified");

    mocks.createUser.mockResolvedValue(testUser);

    mocks.createSession.mockResolvedValue(
      testSession
    );

    mocks.clearPending.mockResolvedValue(undefined);

    mocks.setSessionCookie.mockResolvedValue(
      undefined
    );
  });

  it("rejects an invalid registration flow", async () => {
    await expect(
      invokeRegistration({ flow: "login" })
    ).rejects.toThrow("Invalid verification flow");

    expect(mocks.getPending).not.toHaveBeenCalled();
    expect(mocks.verifyOTP).not.toHaveBeenCalled();
    expect(mocks.createUser).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("rejects an expired pending registration", async () => {
    mocks.getPending.mockResolvedValue(null);

    await expect(
      invokeRegistration()
    ).rejects.toThrow("Registration expired");

    expect(mocks.verifyOTP).not.toHaveBeenCalled();
    expect(mocks.createUser).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it.each([
    ["incorrect", "Incorrect OTP"],
    ["locked", "Too many attempts"],
    ["expired", "OTP expired"],
  ] as const)(
    "rejects OTP result: %s",
    async (result, expectedMessage) => {
      mocks.verifyOTP.mockResolvedValue(result);

      await expect(
        invokeRegistration()
      ).rejects.toThrow(expectedMessage);

      expect(mocks.createUser).not.toHaveBeenCalled();
      expect(mocks.createSession).not.toHaveBeenCalled();
      expect(mocks.setSessionCookie).not.toHaveBeenCalled();
    }
  );

  it("creates a verified user after successful OTP verification", async () => {
    await invokeRegistration();

    expect(mocks.verifyOTP).toHaveBeenCalledWith(
      testEmail,
      "123456"
    );

    expect(mocks.createUser).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: testEmail,
        emailVerified: true,
        firstName: "Nitish",
        lastName: "Viraktamath",
        name: "Nitish Viraktamath",
      }),
    });

    // Verify that OTP verification happens before
    // permanent user creation.
    expect(
      mocks.verifyOTP.mock.invocationCallOrder[0]
    ).toBeLessThan(
      mocks.createUser.mock.invocationCallOrder[0]
    );
  });

  it("supports registration without a last name", async () => {
    mocks.getPending.mockResolvedValue({
      ...pendingRegistration,
      lastName: null,
    });

    await invokeRegistration();

    expect(mocks.createUser).toHaveBeenCalledWith({
      data: expect.objectContaining({
        firstName: "Nitish",
        lastName: null,
        name: "Nitish",
      }),
    });
  });

  it("creates a Better Auth session for the registered user", async () => {
    await invokeRegistration();

    expect(mocks.createSession).toHaveBeenCalledWith(
      testUser.id
    );

    expect(mocks.setSessionCookie).toHaveBeenCalledWith(
      expect.anything(),
      {
        session: testSession,
        user: testUser,
      }
    );
  });

  it("does not expose the session token in the response", async () => {
    const result = await invokeRegistration();

    expect(result).toMatchObject({
      success: true,
      user: {
        id: testUser.id,
        email: testEmail,
        name: "Nitish Viraktamath",
      },
    });

    expect(JSON.stringify(result)).not.toContain(
      testSession.token
    );
  });

  it("handles duplicate email conflicts", async () => {
    const conflictError = Object.assign(
      new Error("Unique constraint failed"),
      { code: "P2002" }
    );

    mocks.createUser.mockRejectedValue(
      conflictError
    );

    await expect(
      invokeRegistration()
    ).rejects.toThrow(
      "An account already exists for this email"
    );

    expect(mocks.createSession).not.toHaveBeenCalled();
    expect(mocks.setSessionCookie).not.toHaveBeenCalled();
  });

  it("handles session creation failure", async () => {
    mocks.createSession.mockResolvedValue(null);

    await expect(
      invokeRegistration()
    ).rejects.toThrow(
      "Account created, but automatic sign-in failed"
    );

    // The user was created successfully.
    expect(mocks.createUser).toHaveBeenCalledTimes(1);

    // No authentication cookie should be issued.
    expect(mocks.setSessionCookie).not.toHaveBeenCalled();
  });

  it("clears pending registration after successful creation", async () => {
    await invokeRegistration();

    expect(mocks.clearPending).toHaveBeenCalledWith(
      testEmail
    );
  });

  it("continues session creation if pending cleanup fails", async () => {
    mocks.clearPending.mockRejectedValue(
      new Error("Redis cleanup failed")
    );

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      await expect(
        invokeRegistration()
      ).resolves.toMatchObject({
        success: true,
      });

      expect(mocks.createSession).toHaveBeenCalledWith(
        testUser.id
      );

      expect(mocks.setSessionCookie).toHaveBeenCalled();
    } finally {
      consoleSpy.mockRestore();
    }
  });
});