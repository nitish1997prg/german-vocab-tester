
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import type { GermanLevel, VocabularyQuestion } from "@/types/quiz";

//Quiz Schema
import { QuizBatchSchema } from "@/lib/quiz-schema";

//Vocab filter - preserve uniqueness in a batch and across different batches
import { filterUniqueQuestions } from "@/lib/quiz-uniqueness";

//Fischer-Yates shuffling of options
import { shuffleQuestionOptions, shuffleQuestions } from "@/lib/quiz-shuffle";

import {
  GeneratedQuizBatchSchema,
} from "@/lib/quiz-schema";

import crypto from 'node:crypto';

const validLevels: GermanLevel[] = ["A1", "A2", "B1", "B2"];

const TARGET_BATCH_SIZE = 10;
const MAX_GENERATION_ATTEMPTS = 3;
const SYSTEM_PROMPT =  `
You are an experienced German language teacher
specializing in CEFR-aligned vocabulary assessment.

Generate exactly the requested number of German
multiple-choice vocabulary questions.

VOCABULARY RULES:
- Use vocabulary appropriate for the requested CEFR level.
- Choose a variety of nouns, verbs, and adjectives.
- Include the definite article for German nouns.
- Use infinitive forms for verbs.
- Avoid overly obscure words that are inappropriate
  for the selected CEFR level.
- Do not repeat words within the batch.
- Do not generate any word in excludedWords.
- Vary vocabulary across everyday life, work,
  education, travel, relationships, and emotions
  when appropriate for the selected level.

TRANSLATION ACCURACY:
- Use a precise, commonly accepted English translation.
- Exactly one of the four options must be correct.
- Incorrect options must not be synonyms or valid
  alternative translations of the German word.
- Avoid German words whose intended meaning is
  ambiguous without additional context.
- Avoid misleading or overly broad translations.
- All four options should be plausible alternatives
  with similar grammatical roles.
- Double-check that no incorrect option could
  reasonably be accepted as correct.

OUTPUT RULES:
- Return only a valid JSON object.
- The root object must contain a "questions" array.
- Each question must contain:
  level, word, options, correctOptionIndex.
- options must contain exactly four English strings.
- correctOptionIndex must be an integer from 0 to 3.
- Do not include an id field.
- Do not include Markdown or explanations.
`;


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

    const questions: VocabularyQuestion[] = [];

    let invalidAttempts = 0;

    for (
      let attempt = 1;
      attempt <= MAX_GENERATION_ATTEMPTS;
      attempt++
    ) {
      const remaining =
        TARGET_BATCH_SIZE - questions.length;

      if (remaining === 0) {
        break;
      }

      const usedWords = [
        ...excludedWords,
        ...questions.map((question) => question.word),
      ];

      console.log(
        `Generation attempt ${attempt}: need ${remaining} words`
      );

      // Generate vocabulary using Claude
      let message;

      try {
        message = await anthropic.messages.create({
          model: "claude-haiku-4-5",
          max_tokens: 3600,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: JSON.stringify({
                level,
                count: remaining,
                excludedWords: usedWords,
              }),
            },
          ],
        });
      } catch (error) {
        console.error("AI provider error:", error);

        return NextResponse.json(
          { error: "AI service temporarily unavailable" },
          { status: 503 }
        );
      }

      // Extract text from Claude's response
      const textBlock = message.content.find(
        (block) => block.type === "text"
      );

      if (!textBlock) {
        invalidAttempts++;
        continue;
      }

      // Parse Claude's JSON response
      let generated: unknown;

      try {
        let rawResponse = textBlock.text.trim();

        const fencedMatch = rawResponse.match(
          /^```(?:json)?\s*([\s\S]*?)\s*```$/i
        );

        if (fencedMatch) {
          rawResponse = fencedMatch[1];
        }

        generated = JSON.parse(rawResponse);
      } catch {
        console.error("Claude returned invalid JSON");
        invalidAttempts++;
        continue;
      }

      // Validate the structure with Zod
      const validationResult =
        GeneratedQuizBatchSchema.safeParse(generated);

      if (!validationResult.success) {
        console.error(
          "Validation failed:",
          validationResult.error.issues
        );

        invalidAttempts++;
        continue;
      }

      const generatedQuestions = validationResult.data.questions.map(
            (question) => ({
              ...question,
              id: crypto.randomUUID(),
            })
          );

      // Remove duplicates and mismatched levels
      const uniqueQuestions = filterUniqueQuestions(
        generatedQuestions,
        usedWords,
        level
      );

      console.log(
        `Accepted ${uniqueQuestions.length} unique words`
      );

      // Add accepted questions to the accumulated batch
      questions.push(...uniqueQuestions.slice(0, remaining));
    }

    // Return whatever valid questions we collected
    if (questions.length > 0) {
      const shuffledQuestions = shuffleQuestions(
            questions.map((question) =>
              shuffleQuestionOptions(question)
            )
          );
      return NextResponse.json({
        status: "ready",
        questions: shuffledQuestions
      });
    }

    // Invalid responses should not imply exhaustion
    if (invalidAttempts > 0) {
      return NextResponse.json(
        { error: "Could not generate valid questions" },
        { status: 502 }
      );
    }

    // All attempts were structurally valid,
    // but none produced any new unique words
    return NextResponse.json({
      status: "noMoreWords",
      questions: [],
    });


  } catch (error) {
    console.error("Quiz generation failed:", error);

    return NextResponse.json(
      { error: "Failed to generate vocabulary questions" },
      { status: 502 }
    );
  }
}
