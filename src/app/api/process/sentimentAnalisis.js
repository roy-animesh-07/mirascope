// import {vader} from "vader-sentiment"
const vader = require('vader-sentiment');
export default function analyser(freq,question) {
  let pos = 0,
    neg = 0,
    net = 0;
  for (let res of question.responses) {
    const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(res);
    if (intensity.compound >= 0.05) pos += freq[question.question][res];
    else if (intensity.compound >= -0.05) net += freq[question.question][res];
    else neg += freq[question.question][res];
  }
  let tot = pos + neg + net;
  pos = Number(((pos / tot) * 100).toFixed(2));
  neg = Number(((neg / tot) * 100).toFixed(2));
  net = Number(((net / tot) * 100).toFixed(2));
  const sentiment = {
    positive: pos,
    neutral: net,
    negative: neg,
  };

  return sentiment;
}
