import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);
ChartJS.register({
  id: "centerText",
  afterDraw(chart) {
    if (!chart.options.plugins?.centerText) return;
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0).data[0];
    if (!meta) return;

    ctx.save();
    ctx.font = "600 14px Inter, sans-serif";
    ctx.fillStyle = "#111827";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.restore();
  },
});

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}
  >
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-xl font-semibold text-gray-900">{children}</h2>
);

const StatPill = ({ label, value }) => (
  <div className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">
    <span className="font-medium">{label}:</span> {value ?? "N/A"}
  </div>
);

const ProgressBar = ({ label, value, textColor, barColor }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className={`font-medium ${textColor}`}>{label}</span>
      <span>{value}%</span>
    </div>

    <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
      <div
        className={`h-2 rounded ${barColor}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const ScaleLegend = ({ scale }) => {
  if (!scale) return null;

  return (
    <div className="mt-4 rounded-lg bg-gray-50 border p-4">
      <p className="text-xs font-medium text-gray-500 mb-2">Scale meaning</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {Object.entries(scale).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white border font-medium">
              {key}
            </span>
            <span className="text-gray-700">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 800,
    easing: "easeOutQuart",
  },
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        boxWidth: 10,
        padding: 14,
        font: { size: 11, weight: "500" },
      },
    },
    tooltip: {
      backgroundColor: "#111827",
      titleColor: "#fff",
      bodyColor: "#e5e7eb",
      padding: 10,
      cornerRadius: 8,
    },
  },
};


const OutputResult = ({ data }) => {
  const questions = data.questions.filter((q) => q.useful);
  const actions = data.actions;

  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-14 py-10 space-y-16">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Survey Analysis Report
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Source File: <span className="font-medium">{data.fileName}</span>
        </p>
      </div>

      <section className="space-y-8">
        <SectionTitle>📊 Question-wise Insights</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {questions.map((q, i) => {
            const readableQ = q.question.replaceAll("_", " ");

            if (q.type === "text") {
              return (
                <Card key={i} className="md:col-span-2">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
                    {readableQ}
                  </h3>

                  
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Sentiment Breakdown
                    </p>
                    <div className="space-y-2">
                      <ProgressBar
                        label="Positive"
                        value={q.sentiment.positive}
                        textColor="text-green-600"
                        barColor="bg-green-500"
                      />

                      <ProgressBar
                        label="Neutral"
                        value={q.sentiment.neutral}
                        textColor="text-yellow-600"
                        barColor="bg-yellow-400"
                      />

                      <ProgressBar
                        label="Negative"
                        value={q.sentiment.negative}
                        textColor="text-red-600"
                        barColor="bg-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Key Themes & Quotes
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.theme.map((t, idx) => (
                        <div
                          key={idx}
                          className="border rounded-lg p-4 bg-gray-50"
                        >
                          <p className="text-xs font-semibold uppercase text-indigo-600">
                            {t.theme}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            “{t.quote}”
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            }

            return (
              <Card key={i}>
                <h3 className="text-base font-semibold text-gray-900">
                  {readableQ}
                </h3>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-4">
                  {q.type.replaceAll("_", " ")}
                </p>

                
                {q.stats && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <StatPill label="Avg" value={q.stats.average} />
                    <StatPill label="Median" value={q.stats.median} />
                    <StatPill label="Mode" value={q.stats.mode} />
                  </div>
                )}

          
                <div className="h-[260px]">
                  {i % 2 === 0 ? (
                    <Doughnut
                      options={{
                        ...baseOptions,
                        cutout: "65%",
                        plugins: {
                          ...baseOptions.plugins,
                          centerText: true,
                          legend: { position: "right" },
                        },
                      }}
                      data={{
                        labels: Object.keys(q.distribution),
                        datasets: [
                          {
                            data: Object.values(q.distribution),
                            backgroundColor: [
                              "#6366f1",
                              "#22c55e",
                              "#f59e0b",
                              "#ef4444",
                              "#0ea5e9",
                              "#a855f7",
                            ],
                            borderWidth: 2,
                            borderColor: "#fff",
                          },
                        ],
                      }}
                    />
                  ) : (
                    <Bar
                      options={{
                        ...baseOptions,
                        scales: {
                          x: { grid: { display: false } },
                          y: { grid: { color: "#e5e7eb", drawBorder: false } },
                        },
                      }}
                      data={{
                        labels: Object.keys(q.distribution),
                        datasets: [
                          {
                            label: "Responses",
                            data: Object.values(q.distribution),
                            backgroundColor: "#6366f1",
                            borderRadius: 10,
                            barThickness: 32,
                          },
                        ],
                      }}
                    />
                  )}
                </div>

                
                {q.type === "ordered_single_choice" && (
                  <ScaleLegend scale={q.scale} />
                )}

                
                {q.top_values && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Top Selections
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {q.top_values.map((tv, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 border"
                        >
                          {tv.value} ({tv.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle>Recommended Actions</SectionTitle>
        <p className="text-sm text-gray-500 max-w-2xl">
          These recommendations are derived from sentiment signals, response
          distributions, and observed patterns in the survey data.
        </p>

        <div className="space-y-4">
          {actions.map((ac, i) => (
            <Card key={i}>
              <p className="text-sm font-medium text-gray-900 leading-relaxed">
                {ac.action}
              </p>
              <div className="mt-4">
                <ProgressBar
                  label="Confidence"
                  value={Math.round(ac.confidence * 100)}
                  textColor="text-indigo-600"
                  barColor="bg-indigo-500"
                />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default OutputResult;
