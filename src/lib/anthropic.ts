import Anthropic from "@anthropic-ai/sdk";
import { JudgeResponse, SubMetrics } from "./types";
import { validateSubMetrics } from "./tqi";
import { JUDGES, type JudgeId } from "./judges";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (client) return client;
  client = new Anthropic();
  return client;
}

function parseJsonResponse(text: string): { verdict: string; sub_metrics: SubMetrics } {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return JSON.parse(cleaned);
}

async function callJudgeInternal(
  systemPrompt: string,
  imageBase64: string,
  mimeType: "image/jpeg" | "image/png",
  userPrompt: string = "Rate this toast."
): Promise<JudgeResponse> {
  const anthropic = getClient();

  const makeCall = async () => {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType, data: imageBase64 },
            },
            { type: "text", text: userPrompt },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text in response");
    }
    return textBlock.text;
  };

  let parsed: { verdict: string; sub_metrics: SubMetrics };

  try {
    const text = await makeCall();
    parsed = parseJsonResponse(text);
  } catch {
    // Retry once
    const text = await makeCall();
    parsed = parseJsonResponse(text);
  }

  if (!validateSubMetrics(parsed.sub_metrics)) {
    throw new Error("Invalid sub-metrics from judge");
  }

  return {
    verdict: parsed.verdict,
    sub_metrics: parsed.sub_metrics,
    tqi: 0, // Recalculated server-side
  };
}

export async function callJudge(
  judge: JudgeId,
  imageBase64: string,
  mimeType: "image/jpeg" | "image/png",
  userPrompt?: string
): Promise<JudgeResponse> {
  const definition = JUDGES[judge];
  if (!definition) {
    throw new Error(`Unknown judge: ${judge}`);
  }
  return callJudgeInternal(definition.systemPrompt, imageBase64, mimeType, userPrompt);
}
