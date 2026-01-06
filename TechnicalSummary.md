# Technical Summary

**What Mirascope does (short):**
Mirascope turns survey CSV files into easy-to-read reports. It extracts sentiment, finds common themes, and suggests prioritized actions so teams can act on feedback faster.

---

## How it works — Step by step 
1. **Upload a CSV**: The file needs a header row (each column is a question).
2. **Parse the CSV**: The upload route reads rows and columns and returns parsed rows and file metadata.
3. **Detect question types**: Each column is classified (text, rating, category, multi-choice, timestamp).
4. **Analyze responses**:
   - For free-text: run sentiment analysis and theme extraction.
   - For ratings: compute distributions and simple stats (average, median, mode).
5. **Generate recommendations**: Google Gemini  creates prioritized, actionable suggestions.
6. **Save & review**: The report is saved to the database and shown in the dashboard; charts and exports are available.

---

## In-depth internals
This section walks through what happens under the hood when you upload a CSV and generate a report. It lists the endpoints, the functions called, the important variables at each step, and example data shapes.

### 1) Client → /api/upload (CSV parsing)
- Client call: `fetch('/api/upload', { method: 'POST', body: FormData })` (see `src/app/page.js:handleUpload`).
- Handler: `src/app/api/upload/route.js` (POST)
  - Inputs (FormData): `file` (File object), `apiKey` (optional string)
  - Key steps:
    - `file.arrayBuffer()` → `Buffer.from(arrayBuffer)` to get a Node buffer
    - `parse(buffer, { columns: true, skip_empty_lines: true })` (csv-parse) → `records`
    - `result = records.map(r => ({ ...r }))`
    - `fileName = file.name`
  - Response JSON: `{ result, fileName, apiKey }`

Example `result` (from `/api/upload`):
{
  "result": [
    { "Age": "34", "Department": "Sales", "How satisfied are you?": "4", "Feedback": "Delivery was slow" },
    { "Age": "28", "Department": "Marketing", "How satisfied are you?": "5", "Feedback": "Great experience" }
  ],
  "fileName": "survey.csv",
  "apiKey": "user-supplied-or-empty"
}

### 2) /api/process (main pipeline)
- Client sends the entire upload response as JSON: `fetch('/api/process', { body: JSON.stringify(data) })` where `data` is the upload response.
- Handler: `src/app/api/process/route.js` (POST)
  - Key inputs from body: `data.result` (rows array), `data.fileName`, `data.apiKey`
  - Authentication: if user logged in, server attempts to read or store encrypted API key in `User.apikey` (uses `src/lib/crypto.js` encrypt/decrypt + `src/lib/mongodb.js`).

Key variables inside the route:
- `infos = [...data.result]` — array of row objects (each row = one respondent).
- `freq` — object that maps question (column name) → { value -> count }
  - Built by scanning all rows and counting occurrences per column value.

Example `freq` (simplified):
{
  "How satisfied are you?": { "5": 120, "4": 45, "3": 10 },
  "Feedback": { "Delivery was slow": 12, "Great experience": 30 }
}

- `questions = await processColumn(freq, apiKey)`
  - `processColumn` uses `@google/genai` (Gemini) to classify each question and return an array of question metadata objects.
  - Expected output schema (from the prompt):
    {
      "question": "<orig text>",
      "type": "ordered_single_choice|categorical_single_choice|multi_choice|text|timestamp|duration",
      "useful": true|false,
      "scale": { "1": "Poor", "2": "Fair", "3": "Good" } | null
    }

Update: Fixed — `processColumn` and `actionsPredictor` now accept an `apiKey` parameter and forward it into their respective Gemini calls. The `/api/process` route passes the user-provided or stored API key (when available) into these helpers so AI calls use the correct key for per-user requests.

### 3) Per-question processing (route.js loop)
For each `question` in `questions` the route fills in different fields depending on `type`:
- If `question.type === 'text'`:
  - `question.responses = Object.keys(freq[question.question])` → array of unique text responses
  - `question.sentiment = analyser(freq, question)` (see `sentimentAnalisis.js`)
    - Uses `vader-sentiment`: iterates `question.responses`, computes `polarity_scores(res)` and aggregates counts by response frequency from `freq` into `positive`, `neutral`, `negative` buckets.
    - Returns: `{ positive: Number, neutral: Number, negative: Number }`
  - `question.theme = themeExtractor(freq, question, infos)` (see `themeExtraction.js`)
    - Builds term frequencies, computes a TF-IDF-like score across responses, filters stopwords (via `cleanWord`), and returns top themes with a sample quote per theme: `[ { theme: "delivery", quote: "Delivery was slow" }, ... ]`
  - `delete question.responses` to avoid storing raw list.

- If `question.type === 'ordered_single_choice'`:
  - Builds `labelToNumber` from `question.scale` (e.g., `{ "Poor": 1, "Fair": 2, "Good": 3 }`)
  - Converts string labels in `freq` to numeric labels and produces `question.distribution` keyed by numeric label.
  - Computes `[values, stats] = statsCalc(entries)`:
    - `values` is a flattened array of numeric observations (repeated by count)
    - `stats = { average, median, mode }` (average rounded to 2 decimals)
  - Attaches `question.stats`.

- If `question.type === 'categorical_single_choice'`:
  - `question.distribution = freq[question.question]` (raw counts)
  - `question.top_values` is an array of top 5 values with counts.

- If `question.type === 'multi_choice'`:
  - Explodes comma-separated answers into items, sums counts into `question.distribution`, sets `question.top_values` and `question.values`.

After all questions:
- `result.questions = questions`
- `result.actions = await actionsPredictor(questions, apiKey)`
  - `actionsPredictor` prepares a reduced `report_data` (pulls sentiment/themes/stats/distributions) and sends a prompt to Gemini to produce JSON actions: `[ { action: "<text>", confidence: 0.8 }, ... ]`


Finally `result.fileName = fileName` and the route responds `NextResponse.json(result)`.

### 4) Saving reports
- If the client is logged in, the front-end posts the processed `result` back to `/api/save`.
- `src/app/api/save/route.js` stores the report in MongoDB via the `Report` model: `{ user: user._id, report: data }`.

### 5) Data model shapes (summary)
- Upload `result`: Array of rows — each row is an object keyed by header name.
- `freq`: Object { question: { value: count } }
- `question` object (example):
{
  "question": "Feedback",
  "type": "text",
  "useful": true,
  "scale": null,
  "sentiment": { "positive": 30, "neutral": 10, "negative": 5 },
  "theme": [ { "theme": "delivery", "quote": "Delivery was slow" } ]
}
- Final `result` returned from `/api/process`:
{
  "questions": [ /* question objects */ ],
  "actions": [ { "action": "Investigate shipping vendors", "confidence": 0.9 } ],
  "fileName": "survey.csv"
}