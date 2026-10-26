
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import type { GermanLevel } from "@/types/quiz";

const validLevels: GermanLevel[] = ["A1", "A2", "B1", "B2"];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { level, excludedWords } = body;

    // Validate basic request parameters
    if (
      !validLevels.includes(level) ||
      !Array.isArray(excludedWords) ||
      excludedWords.length > 500 ||
      !excludedWords.every(
        (word) => typeof word === "string" && word.length <= 80
      )
    ) {
      return NextResponse.json(
        { error: "Invalid quiz request" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 503 }
      );
    }

    const anthropic = new Anthropic();

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1500,
      system: `
        You generate German vocabulary quizzes for language learners.

        Generate exactly 5 vocabulary questions for the specified CEFR level.

        Rules:
        - Use German nouns, verbs, and adjectives.
        - Include the definite article for nouns.
        - Provide 4 English answer options per question.
        - Exactly one option must be correct.
        - Avoid repeating German words within the batch.
        - Do not generate words from the excluded list.
        - Use vocabulary appropriate for the requested CEFR level.
        - Give each question a unique string ID.
        - Vary the position of the correct answer.

        Return ONLY valid JSON in this format:
        {
        "questions": [
            {
            "id": "q-001",
            "level": "A1",
            "word": "der Apfel",
            "options": ["Apple", "Water", "House", "Book"],
            "correctOptionIndex": 0
            }
        ]
        }

        Do not include Markdown or explanatory text.
            `,
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            level,
            excludedWords,
          }),
        },
      ],
    });

    const textBlock = message.content.find(
      (block) => block.type === "text"
    );

    if (!textBlock) {
      throw new Error("AI returned no text response");
    }

    
    let rawResponse = textBlock.text.trim();

    // Remove Markdown code fences if Claude included them
    const fencedMatch = rawResponse.match(
    /^```(?:json)?\s*([\s\S]*?)\s*```$/i
    );

    if (fencedMatch) {
    rawResponse = fencedMatch[1];
    }

    // Parse the cleaned JSON string
    const generated: unknown = JSON.parse(rawResponse);


    if (
      !generated ||
      typeof generated !== "object" ||
      !("questions" in generated) ||
      !Array.isArray(generated.questions)
    ) {
      throw new Error("AI returned an invalid question list");
    }

    return NextResponse.json({
      status: "ready",
      questions: generated.questions,
    });

  } catch (error) {
    console.error("Quiz generation failed:", error);

    return NextResponse.json(
      { error: "Failed to generate vocabulary questions" },
      { status: 502 }
    );
  }
}
