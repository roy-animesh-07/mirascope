import { GoogleGenAI } from "@google/genai";

async function qtypebygpt(freq, apiKey) {
  const ai = new GoogleGenAI({ apiKey:apiKey });
  const questionsArr = [];

  for (let key in freq) {
    const five_unique_values = Object.keys(freq[key]).slice(
      0,
      Math.min(5, Object.keys(freq[key]).length)
    );
    questionsArr.push({
      question: key,
      samples: five_unique_values,
    });
  }

  const prompt = `
You are a deterministic data-analysis engine for survey forms.
Your job is to classify each survey question and extract metadata strictly for analysis.

Allowed question types (choose ONE only):
- ordered_single_choice
- categorical_single_choice
- multi_choice
- text
- timestamp
- duration

TYPE RULES:
- Ordered or numeric response options (ratings, frequency, Likert, levels) → ordered_single_choice
- Unordered categories (gender, department, role, region) → categorical_single_choice
- Questions allowing multiple selections → multi_choice
- Free-form sentences, explanations, feedback → text
- Date/time values (date, time, or datetime) → timestamp
- Time spent / length of time (e.g. minutes, hours) → duration

USEFULNESS RULES:
- Set "useful": false for metadata, system fields, or internal tracking
  (e.g. timestamp, response ID, submission time, internal flags).
- Set "useful": false for file uploads, links, signatures, or proof-only fields.
- Set "useful": true only if the question can produce insights such as
  opinions, preferences, sentiment, ratings, distributions, or trends.
- If uncertain, set "useful": false.

SCALE RULES:
- Generate a scale ONLY if type = ordered_single_choice.
- Scale must be strictly increasing (lowest → highest).
- Keys must start from "1" and increment by 1.
- If options are numeric, preserve numeric meaning (e.g. "3" → 3).
- If options are text, infer the logical order (e.g. Poor < Fair < Good < Excellent).
- If the order cannot be confidently inferred, set "scale": null.
- Never guess a scale.

OUTPUT RULES (CRITICAL):
- Return ONLY raw JSON.
- Do NOT use markdown, backticks, comments, or explanations.
- Output must start with '[' and end with ']'.
- Each item must follow the schema exactly.
- Any extra text makes the response invalid.

Each item must be exactly:
{
  "question": "<original question text>",
  "type": "<one allowed type>",
  "useful": true | false,
  "scale": { "1": "<label>", "2": "<label>", "...": "..." } | null
}

Data:
${JSON.stringify(questionsArr)}
`;


  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
  });

  return JSON.parse(response.text);
}

export default async function processColumn(freq) {
  return await qtypebygpt(freq);
}
