
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createHmac, randomUUID } from "node:crypto";

import { QuestionReportSchema } from "@/lib/report-schema";

import { requireApiAuth } from "@/lib/auth/require-api-auth";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 4096;
const REPORT_TTL_SECONDS = 30 * 24 * 60 * 60;

class BodyTooLargeError extends Error {}

async function readBoundedJson(request: Request) {
  if (!request.body) {
    throw new SyntaxError("Missing body");
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();

  let received = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    received += value.byteLength;

    if (received > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new BodyTooLargeError();
    }

    text += decoder.decode(value, {
      stream: true,
    });
  }

  return JSON.parse(text + decoder.decode());
}

export async function POST(request: Request) {
  
  const authError = await requireApiAuth(request);

  if (authError) {
    return authError;
  }
  let body: unknown;

  try {
    body = await readBoundedJson(request);
  } catch (error) {
    const tooLarge = error instanceof BodyTooLargeError;

    return NextResponse.json(
      {
        error: tooLarge
          ? "Request body too large"
          : "Invalid request body",
      },
      { status: tooLarge ? 413 : 400 }
    );
  }

  const result = QuestionReportSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid report" },
      { status: 400 }
    );
  }

  const secret = process.env.REPORT_RATE_LIMIT_SALT;

  if (
    !secret ||
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    console.error("Report storage is not configured");

    return NextResponse.json(
      { error: "Reporting is temporarily unavailable" },
      { status: 503 }
    );
  }

  try {
    const redis = Redis.fromEnv();

    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 m"),
      prefix: "gvt:report-rate-limit",
    });

    // Vercel supplies the originating IP.
    // Never store the raw IP in our report data.
    const ip =
      request.headers
        .get("x-vercel-forwarded-for")
        ?.split(",")[0]
        ?.trim() ||
      request.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim() ||
      "unknown";

    const identifier = createHmac("sha256", secret)
      .update(ip)
      .digest("hex");

    const { success } = await limiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        { error: "Too many reports. Try again later." },
        { status: 429 }
      );
    }

    const reportId = randomUUID();

    const report = {
      ...result.data,
      id: reportId,
      receivedAt: new Date().toISOString(),
    };

    await redis.set(
      `gvt:report:${reportId}`,
      report,
      { ex: REPORT_TTL_SECONDS }
    );

    console.info("quiz.report_received", {
      reportId,
      reason: report.reason,
    });

    return NextResponse.json(
      { success: true },
      { status: 201 }
    );
  } catch {
    console.error("Failed to store quiz report");

    return NextResponse.json(
      { error: "Unable to submit report" },
      { status: 503 }
    );
  }
}
