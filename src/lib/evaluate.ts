import { callJudge } from "./anthropic";
import { calculateTqi, deriveTier } from "./tqi";
import { JUDGES, type JudgeId } from "./judges";
import type { JudgeVerdict } from "./types";

export interface EvaluationResult {
  verdicts: JudgeVerdict[];
  officialTqi: number;
  officialTier: string;
}

export async function runJudgePanel(
  judgeIds: JudgeId[],
  imageBase64: string,
  mimeType: "image/jpeg" | "image/png"
): Promise<EvaluationResult> {
  const results = await Promise.allSettled(
    judgeIds.map((j) => callJudge(j, imageBase64, mimeType))
  );

  const verdicts: JudgeVerdict[] = [];
  const tqis: number[] = [];

  for (let i = 0; i < judgeIds.length; i++) {
    const judgeId = judgeIds[i];
    const result = results[i];

    if (result.status === "fulfilled") {
      const tqi = calculateTqi(result.value.sub_metrics);
      const tier = deriveTier(tqi);
      verdicts.push({
        judge_id: judgeId,
        judge_name: JUDGES[judgeId].displayName,
        verdict: result.value.verdict,
        tqi,
        tier,
        metrics: result.value.sub_metrics,
      });
      tqis.push(tqi);
    } else {
      console.error(`[evaluate] ${judgeId} judge failed:`, result.reason);
    }
  }

  if (tqis.length === 0) {
    throw new Error("All judges failed");
  }

  const sum = tqis.reduce((a, b) => a + b, 0);
  const officialTqi = Math.round((sum / tqis.length) * 100) / 100;
  const officialTier = deriveTier(officialTqi);

  return { verdicts, officialTqi, officialTier };
}
