
import {
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { getSessionMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
}));

import { requireApiAuth } from "./require-api-auth";

function makeRequest() {
  return new Request(
    "http://localhost:3000/api/protected-test",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

describe("requireApiAuth", () => {
  beforeEach(() => {
    vi.stubEnv("APP_AUTH_GUARD_ENABLED", "true");
    getSessionMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects requests without a session", async () => {
    getSessionMock.mockResolvedValue(null);

    const response = await requireApiAuth(makeRequest());

    expect(response?.status).toBe(401);
    expect(await response?.json()).toEqual({
      error: "Authentication required",
      code: "UNAUTHORIZED",
    });
  });

  it("allows a valid authenticated session", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        id: "user-123",
        email: "test@example.com",
      },
      session: {
        id: "session-123",
        userId: "user-123",
      },
    });

    const response = await requireApiAuth(makeRequest());

    expect(response).toBeNull();
    expect(getSessionMock).toHaveBeenCalledOnce();
  });

  it("rejects a session without a user", async () => {
    getSessionMock.mockResolvedValue({
      user: null,
      session: { id: "session-123" },
    });

    const response = await requireApiAuth(makeRequest());

    expect(response?.status).toBe(401);
  });

  it("fails closed when Better Auth throws", async () => {
    getSessionMock.mockRejectedValue(
      new Error("Database unavailable")
    );

    const response = await requireApiAuth(makeRequest());

    expect(response?.status).toBe(503);

    expect(await response?.json()).toEqual({
      error: "Authentication temporarily unavailable",
      code: "AUTH_UNAVAILABLE",
    });
  });

  it("does not cache unauthorized responses", async () => {
    getSessionMock.mockResolvedValue(null);

    const response = await requireApiAuth(makeRequest());

    expect(response?.headers.get("Cache-Control"))
      .toBe("no-store");
  });

  it("passes the incoming request headers to Better Auth", async () => {
    getSessionMock.mockResolvedValue(null);

    const request = makeRequest();

    await requireApiAuth(request);

    expect(getSessionMock).toHaveBeenCalledWith({
      headers: request.headers,
    });
  });

  it("respects the temporary development feature flag", async () => {
    vi.stubEnv("APP_AUTH_GUARD_ENABLED", "false");

    const response = await requireApiAuth(makeRequest());

    expect(response).toBeNull();
    expect(getSessionMock).not.toHaveBeenCalled();
  });
});
