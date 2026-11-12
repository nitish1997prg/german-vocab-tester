import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUser: vi.fn(),
  savePending: vi.fn(),
  issueOTP: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique: mocks.findUser } } }));
vi.mock("@/lib/auth/pending-registration", () => ({ savePendingRegistration: mocks.savePending }));
vi.mock("@/lib/auth/registration-otp", () => ({ issueRegistrationOTP: mocks.issueOTP }));

import { POST } from "./route";

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("AUTH_OTP_ENABLED", "true");
});

afterEach(() => vi.unstubAllEnvs());

function request() {
  return new Request("http://localhost/api/registration/request-otp", {
    method: "POST",
    body: JSON.stringify({ firstName: "Alex", email: "alex@example.com" }),
  });
}

it("rejects an existing account without saving registration or issuing an OTP", async () => {
  mocks.findUser.mockResolvedValue({ id: "existing-user" });
  const response = await POST(request());

  expect(response.status).toBe(409);
  expect(await response.json()).toEqual({ error: "An account with this email already exists." });
  expect(mocks.savePending).not.toHaveBeenCalled();
  expect(mocks.issueOTP).not.toHaveBeenCalled();
});

it("still issues an OTP for a new account", async () => {
  mocks.findUser.mockResolvedValue(null);
  mocks.issueOTP.mockResolvedValue("sent");
  const response = await POST(request());

  expect(response.status).toBe(200);
  expect(mocks.savePending).toHaveBeenCalledWith({ firstName: "Alex", email: "alex@example.com" });
  expect(mocks.issueOTP).toHaveBeenCalledWith("alex@example.com");
});
