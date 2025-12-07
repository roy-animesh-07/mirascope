import mongoose from "mongoose";

const SentimentSummarySchema = new mongoose.Schema(
  {
    positive: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
    negative: { type: Number, default: 0 },

    chart_base64: { type: String }
  },
  { _id: false }
);

const ThemeSchema = new mongoose.Schema(
  {
    theme: String,
    quote: String
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },

    // "ordered_single_choice", "categorical_single_choice",
    // "multi_choice", "text", "date", "time"
    type: { type: String, required: true },

    // Normalized scale mapping (1 → label)
    scale: {
      type: Map,
      of: String,
      default: {}
    },

    // Normalized answers
    values: {
      type: Array,
      default: []
    },

    // Count per normalized option
    distribution: {
      type: Map,
      of: Number,
      default: {}
    },
    chart_base64: { type: String },

    // Stats (Only for ordered_single_choice)
    stats: {
      average: Number,
      median: Number,
      mode: Number
    },

    // TEXT QUESTIONS ONLY
    responses: {
      type: [String],
      default: []
    },

    themes: [ThemeSchema],

    sentiment: {
      positive: Number,
      neutral: Number,
      negative: Number
    }
  },
  { _id: false }
);

const ActionSchema = new mongoose.Schema(
  {
    action: String,
    confidence: Number
  },
  { _id: false }
);
//Report Schema
const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  meta: {
    createdAt: { type: Date, default: Date.now },
    source: { type: String, default: "csv" }
  },

  sentiment_summary: SentimentSummarySchema,

  questions: [QuestionSchema],

  actions: [ActionSchema],

});

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
