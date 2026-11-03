
import {
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { mockSet, mockLimit } = vi.hoisted(() => ({
  mockSet: vi.fn(),
  mockLimit: vi.fn(),
}));

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({
      set: mockSet,
    }),
  },
}));

vi.mock("@upstash/ratelimit", () => {
  class FakeRatelimit {
    static slidingWindow() {
      return {};
    }

    limit = mockLimit;
  }

  return { Ratelimit: FakeRatelimit };
});

import { POST } from "./route";

const validReport = {
  level: "A1",
  reason: "offensive",
  question: {
    id: "test-question-1",
    word: "das Haus",
    options: [
      "House",
      "Car",
      "Garden",
      "Door",
    ],
    correctOptionIndex: 0,
    explanation: "Das Haus means house.",
  },
};

function createRequest(body: unknown) {
  return new Request(
    "http://localhost:3000/api/report",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
}

beforeEach(() => {
  vi.resetAllMocks();

  vi.stubEnv(
    "UPSTASH_REDIS_REST_URL",
    "https://example.upstash.io"
  );
  vi.stubEnv(
    "UPSTASH_REDIS_REST_TOKEN",
    "test-token"
  );
  vi.stubEnv(
    "REPORT_RATE_LIMIT_SALT",
    "test-salt"
  );

  mockLimit.mockResolvedValue({
    success: true,
  });
  mockSet.mockResolvedValue("OK");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/report", () => {
  it("stores a valid report", async () => {
    const response = await POST(
      createRequest(validReport)
    );

    expect(response.status).toBe(201);

    expect(mockSet).toHaveBeenCalledWith(
      expect.stringMatching(/^gvt:report:/),
      expect.objectContaining({
        level: "A1",
        reason: "offensive",
      }),
      { ex: 2592000 }
    );
  });

  it("rejects invalid reports", async () => {
    const response = await POST(
      createRequest({
        level: "INVALID",
        reason: "offensive",
      })
    );

    expect(response.status).toBe(400);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it("rejects excessive reports", async () => {
    mockLimit.mockResolvedValue({
      success: false,
    });

    const response = await POST(
      createRequest(validReport)
    );

    expect(response.status).toBe(429);
    expect(mockSet).not.toHaveBeenCalled();
  });
});
