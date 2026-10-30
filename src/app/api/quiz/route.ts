
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

import { selectVocabularyThemes } from "@/lib/vocabulary-themes";
import {
  getQuestionDifficulty,
  MAX_QUESTIONS_PER_GAME, shuffleQuestionsWithinDifficulty,
} from "@/lib/quiz-difficulty";

import crypto from 'node:crypto';

const validLevels: GermanLevel[] = ["A1", "A2", "B1", "B2"];
const MAX_REQUEST_BODY_BYTES = 32 * 1024;

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


VOCABULARY EXPLANATIONS:

For every generated vocabulary question, include an
"explanation" field.

Rules:
- Write the explanation in simple English.
- Use one short sentence, preferably under 25 words.
- Explain the meaning or usage of the German word.
- Clarify distinctions that could make an incorrect
  translation seem plausible.
- Keep explanations appropriate for the requested
  CEFR level.
- Do not invent etymologies or grammatical rules.
- Do not simply repeat the correct answer.
- The explanation must agree with the correct option.
- Include the explanation in the existing question JSON.

Example:

{
  "word": "die Voraussetzung",
  "options": [
    "The prerequisite",
    "The experience",
    "The opportunity",
    "The relationship"
  ],
  "correctOptionIndex": 0,
  "explanation": "A Voraussetzung is a condition or requirement that must be met before something can happen."
}


THEMATIC VARIETY:
- The user message includes focusThemes.
- Prefer vocabulary associated with those themes.
- Select vocabulary appropriate for the requested CEFR level.
- Include a variety of nouns, verbs, and adjectives.
- Themes are preferences, not strict restrictions.
- If a theme cannot provide enough suitable vocabulary,
  use other appropriate topics to complete the batch.
- Continue respecting excludedWords.


PROGRESSIVE DIFFICULTY:

The user message contains a difficultyPlan array.

Generate exactly one question for each entry in
difficultyPlan, in the exact order provided.

Interpret the difficulty tiers as follows:

- warmup:
  Familiar, commonly encountered vocabulary within
  the selected CEFR level.

- standard:
  Typical vocabulary appropriate for the selected level.

- hard:
  Less familiar vocabulary that is still appropriate
  for the selected CEFR level.

- challenge:
  More demanding vocabulary near the upper end of
  the selected CEFR level.

IMPORTANT:
- Never exceed the requested CEFR level.
- Difficulty should increase gradually.
- The challenge tier must not introduce vocabulary
  that clearly belongs to a higher CEFR level.
- Keep the returned questions in difficultyPlan order.
- Preserve all translation accuracy requirements.
- Return only the existing JSON question structure.
- Do not add difficulty or id fields to the output.


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



async function readLimitedJson(
  request: Request,
  maxBytes: number
): Promise<unknown> {
  if (!request.body) {
    throw new SyntaxError("Empty request body");
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();

  let receivedBytes = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    receivedBytes += value.byteLength;

    if (receivedBytes > maxBytes) {
      await reader.cancel();
      throw new RangeError("Request body too large");
    }

    text += decoder.decode(value, {
      stream: true,
    });
  }

  text += decoder.decode();

  return JSON.parse(text);
}



export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await readLimitedJson(
        request,
        MAX_REQUEST_BODY_BYTES
      );
    } catch (error) {
      const tooLarge = error instanceof RangeError;

      return NextResponse.json(
        {
          error: tooLarge
            ? "Request body too large"
            : "Invalid JSON request body",
        },
        { status: tooLarge ? 413 : 400 }
      );
    }

    const payload = body as Record<string, unknown>;

    const level = payload.level as GermanLevel;
    const excludedWords = payload.excludedWords;
    const startQuestionNumber = (payload.startQuestionNumber ?? 1) as number;

    // Validate basic request parameters
    if (
      !validLevels.includes(level) ||
      !Array.isArray(excludedWords) ||
      excludedWords.length > 500 ||
      !excludedWords.every(
        (word) => typeof word === "string" && word.length <= 80
      ) || !Number.isInteger(startQuestionNumber) ||
      startQuestionNumber < 1 ||
      startQuestionNumber > MAX_QUESTIONS_PER_GAME 
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
    const targetBatchSize = Math.min(
      TARGET_BATCH_SIZE,
      MAX_QUESTIONS_PER_GAME - startQuestionNumber + 1
    );

    for (
      let attempt = 1;
      attempt <= MAX_GENERATION_ATTEMPTS;
      attempt++
    ) {
      const remaining =
        targetBatchSize - questions.length;
      
      
      const difficultyPlan = Array.from(
        { length: remaining },
        (_, index) =>
          getQuestionDifficulty(
            startQuestionNumber + questions.length + index
          )
      );


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

      const focusThemes = selectVocabularyThemes(level);

      // Generate vocabulary using Claude
      let message;
      const claudeStartedAt = Date.now();


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
                focusThemes,
                difficultyPlan,
              }),
            },
          ],
        });
        
        console.info("quiz.claude_call", {
          outcome: "success",
          level,
          durationMs: Date.now() - claudeStartedAt,
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
        });

      } catch (error) {
        console.error("quiz.claude_call", {
          outcome: "error",
          level,
          durationMs: Date.now() - claudeStartedAt,
          providerStatus:
            error instanceof Anthropic.APIError
              ? error.status
              : null,
        });

        throw error;
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
     const shuffledQuestions =
        shuffleQuestionsWithinDifficulty(
          questions.map((question) =>
            shuffleQuestionOptions(question)
          ),
          startQuestionNumber
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

    if (error instanceof Anthropic.APIError) {
      console.error("Claude request failed", {
        status: error.status,
        name: error.name,
      });

      if (error.status === 429) {
        return NextResponse.json(
          { error: "Question generation is temporarily busy." },
          { status: 503 }
        );
      }

      if (error.status === 529 || error.status === 503) {
        return NextResponse.json(
          { error: "Question generation is temporarily unavailable." },
          { status: 503 }
        );
      }

      if (error.status === 504) {
        return NextResponse.json(
          { error: "Question generation timed out." },
          { status: 504 }
        );
      }

      return NextResponse.json(
        { error: "Question generation failed." },
        { status: 503 }
      );
    }

    // Handle generic errors (like network failures or standard Errors in tests) with 503 if appropriate
    return NextResponse.json(
      { error: "AI service temporarily unavailable" },
      { status: 503 }
    );
  }
}
