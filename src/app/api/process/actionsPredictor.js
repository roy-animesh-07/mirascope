import { GoogleGenAI } from "@google/genai";

async function aiActions(report_data, apiKey) {
  const ai = new GoogleGenAI({ apiKey:apiKey });
  const prompt = `
You are an expert product and data analyst.

You are given analyzed survey results extracted from multiple questions.
Each item may include sentiment analysis, themes with quotes, rating statistics,
or categorical distributions.

Your task:
- Identify the most important insights across all questions.
- Generate clear, actionable recommendations based on the data.
- Each recommendation must be practical, specific, and directly tied to the data.
- Assign a confidence score between 0 and 1 based on how strongly the data supports the action.

Guidelines:
- Prioritize negative sentiment and low ratings.
- Repeated themes across multiple questions increase confidence.
- Large skews in distributions indicate strong signals.
- Do NOT repeat the data verbatim; infer actions from it.
- Avoid generic advice unless clearly justified by data.
- Generate 3 to 5 actions only.

IMPORTANT:
- Return ONLY raw JSON
- Do NOT use markdown, backticks, or code fences
- The response must start with [ and end with ]
- Any extra text makes the response invalid

Each item must follow this format:
{
  "action": "<clear, specific recommendation>",
  "confidence": <number between 0 and 1>
}

Input data:
${JSON.stringify(report_data)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
  });
  
  return JSON.parse(response.text);
}
export default async function actionsPredictor(questions) {
  const report_data = [];
  for (let q of questions) {
    const data = {};
    if (!q.useful) continue;
    data.question = q.question;
    if (q.type === "text") {
      data.sentiment = q.sentiment;
      data.theme = q.theme;
      report_data.push(data);
    } else if (q.type === "ordered_single_choice") {
      data.scale = q.scale;
      data.distribution = q.distribution;
      data.stats = q.stats;
      report_data.push(data);
    } else if (q.type === "categorical_single_choice") {
      data.distribution = q.distribution;
    } else if (q.type === "multi_text") {
      data.distribution = q.distribution;
    }
  }

  const actions = await aiActions(report_data);
  return actions;
}
