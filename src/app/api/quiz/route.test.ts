
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
    const words = [
      ["der Apfel", "Apple"],
      ["das Haus", "House"],
      ["die Katze", "Cat"],
      ["das Buch", "Book"],
      ["der Tisch", "Table"],
      ["der Hund", "Dog"],
      ["die Schule", "School"],
      ["das Fenster", "Window"],
      ["die Blume", "Flower"],
      ["der Garten", "Garden"],
    ] as const;

    

    const validQuestions = words.map(
      ([word, meaning], index) => ({
        ...validQuestion,
        id: index + 1, // Numeric IDs from Claude
        word,
        options: [
          meaning,
          "Mountain",
          "River",
          "Sky",
        ],
        correctOptionIndex: 0,
      })
    );

    mockCreateMessage.mockResolvedValue(
      mockAIResponse({
        questions: validQuestions,
      })
    );

    const response = await POST(createRequest("A1"));

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.status).toBe("ready");
    expect(data.questions).toHaveLength(10);

    
  const expectedTranslations = new Map([
    ["der Apfel", "Apple"],
    ["das Haus", "House"],
    ["die Katze", "Cat"],
    ["das Buch", "Book"],
    ["der Tisch", "Table"],
    ["der Hund", "Dog"],
    ["die Schule", "School"],
    ["das Fenster", "Window"],
    ["die Blume", "Flower"],
    ["der Garten", "Garden"],
  ]);

  for (const question of data.questions) {
    // Every question has a unique server-generated ID
    expect(question.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );

    // Every question retains four answer options
    expect(question.options).toHaveLength(4);

    // Correct translation survives both shuffles
    expect(
      question.options[question.correctOptionIndex]
    ).toBe(expectedTranslations.get(question.word));
  }

  // No duplicate IDs
  expect(
    new Set(data.questions.map(
      (question: { id: string }) => question.id
    )).size
  ).toBe(10);

  // No duplicate vocabulary words
  expect(
    new Set(data.questions.map(
      (question: { word: string }) => question.word
    )).size
  ).toBe(10);


    const appleQuestion = data.questions.find(
      (question: { word: string }) =>
        question.word === "der Apfel"
    );

    expect(appleQuestion).toBeDefined();
    expect(appleQuestion.level).toBe("A1");

    expect(
      appleQuestion.options[appleQuestion.correctOptionIndex]
    ).toBe("Apple");

    expect(appleQuestion.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );

    expect(mockCreateMessage).toHaveBeenCalledTimes(1);
  });



  
    
  it("retries after malformed AI JSON", async () => {
    const words = [
      ["der Apfel", "Apple"],
      ["das Haus", "House"],
      ["die Katze", "Cat"],
      ["das Buch", "Book"],
      ["der Tisch", "Table"],
      ["der Hund", "Dog"],
      ["die Schule", "School"],
      ["das Fenster", "Window"],
      ["die Blume", "Flower"],
      ["der Garten", "Garden"],
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
    expect(data.questions).toHaveLength(10);

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

    
    it("replaces numeric AI IDs with server-generated UUIDs", async () => {
      mockCreateMessage.mockResolvedValue(
        mockAIResponse({
          questions: [
            {
              ...validQuestion,
              id: 123,
            },
          ],
        })
      );

      const response = await POST(
        createRequest("A1")
      );

      expect(response.status).toBe(200);

      const data = await response.json();

      expect(data.status).toBe("ready");
      expect(data.questions.length).toBeGreaterThan(0);

      const question = data.questions[0];

      expect(question.word).toBe("der Apfel");
      expect(question.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );

      expect(mockCreateMessage).toHaveBeenCalledTimes(3);
    });


});

