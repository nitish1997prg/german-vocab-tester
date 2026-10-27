
import {
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { POST } from "./route";

// A fake version of Anthropic's messages.create()
const { mockCreateMessage } = vi.hoisted(() => ({
  mockCreateMessage: vi.fn(),
}));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = {
      create: mockCreateMessage,
    };
  },
}));

beforeEach(() => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-api-key");
  mockCreateMessage.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});



function createRequest(
  level: string,
  excludedWords: string[] = []
): Request {
  return new Request("http://localhost:3000/api/quiz", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      level,
      excludedWords,
    }),
  });
}

const validQuestion = {
  id: "q-001",
  level: "A1",
  word: "der Apfel",
  options: ["Apple", "House", "Book", "Water"],
  correctOptionIndex: 0,
};

function mockAIResponse(data: unknown) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data),
      },
    ],
  };
}



describe("POST /api/quiz", () => {
  it("rejects an invalid CEFR level", async () => {
    const response = await POST(
      createRequest("C1")
    );

    expect(response.status).toBe(400);
    expect(mockCreateMessage).not.toHaveBeenCalled();
  });

  it("returns valid generated questions", async () => {
    mockCreateMessage.mockResolvedValue(
      mockAIResponse({
        questions: [validQuestion],
      })
    );

    const response = await POST(
      createRequest("A1")
    );

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data).toMatchObject({
      status: "ready",
      questions: [
        {
          word: "der Apfel",
          level: "A1",
          correctOptionIndex: 0,
        },
      ],
    });

    expect(mockCreateMessage).toHaveBeenCalled();
  });

  
    it("retries after malformed AI JSON", async () => {
    const words = [
        ["der Apfel", "Apple"],
        ["das Haus", "House"],
        ["die Katze", "Cat"],
        ["das Buch", "Book"],
        ["der Tisch", "Table"],
    ];

    const validQuestions = words.map(([word, meaning], index) => ({
        id: `q-${index}`,
        level: "A1",
        word,
        options: [
        meaning,
        "Mountain",
        "River",
        "Sky",
        ],
        correctOptionIndex: 0,
    }));

    mockCreateMessage
        .mockResolvedValueOnce({
        content: [
            { type: "text", text: "{invalid-json" },
        ],
        })
        .mockResolvedValueOnce(
        mockAIResponse({
            questions: validQuestions,
        })
        );

    const response = await POST(
        createRequest("A1")
    );

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.status).toBe("ready");
    expect(data.questions).toHaveLength(5);

    expect(mockCreateMessage).toHaveBeenCalledTimes(2);
    });


  
    it("returns noMoreWords after repeated duplicates", async () => {
    mockCreateMessage.mockResolvedValue(
        mockAIResponse({
        questions: [validQuestion],
        })
    );

    const response = await POST(
        createRequest("A1", ["der Apfel"])
    );

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data).toEqual({
        status: "noMoreWords",
        questions: [],
    });

    expect(mockCreateMessage).toHaveBeenCalledTimes(3);
    });

    it("returns 503 when the AI provider fails", async () => {
    mockCreateMessage.mockRejectedValue(
        new Error("Service unavailable")
    );

    const response = await POST(
        createRequest("A1")
    );

    expect(response.status).toBe(503);

    const data = await response.json();

    expect(data).toHaveProperty("error");
    });

    it("returns 502 after three invalid responses", async () => {
    mockCreateMessage.mockResolvedValue({
        content: [
        {
            type: "text",
            text: "{invalid-json",
        },
        ],
    });

    const response = await POST(
        createRequest("A1")
    );

    expect(response.status).toBe(502);
    expect(mockCreateMessage).toHaveBeenCalledTimes(3);
    });

});

