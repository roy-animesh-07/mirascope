import {Chart as Chartjs} from "chart.js/auto"
import {Bar,Doughnut,Line} from "react-chartjs-2"
const OutputResult = ({data}) => {
  let res = data["questions"]
  let actions = data["actions"]
  return (
    <div >
  {res.map((q, i) => {
    if(!q.useful) {
      return <div key={i}></div>
    }
    if(q.type ==="ordered_single_choice"){
    return (
      <div key={i}>
        <div>Question: {q.question}</div>
        <div>Type: {q.type}</div>
        <ul>Stats:
          <li>Average: {q.stats.average}</li>
          <li>Median: {q.stats.median}</li>
          <li>Mode: {q.stats.mode}</li>
        </ul>
        <ul>
          Scale:
          {JSON.stringify(q.scale)}
          
        </ul>
        <div className="w-100">
          {
            !(i%2) && <Doughnut data = {{
            labels: Object.keys(q.distribution),
            datasets: [
              {
                label: "Total Responses",
                data: Object.values(q.distribution)
               }]
          }}/>
          }
          {
            (i%2) && <Bar data = {{
            labels: Object.keys(q.distribution),
            datasets: [
              {
                label: "Total Responses",
                data: Object.values(q.distribution)
               }]
          }}/>
          }

          
        </div>
      </div>
    
  )
}
else if(q.type === "categorical_single_choice") {
  return (
  <div key={i}>
        <div>Question: {q.question}</div>
        <div>Type: {q.type}</div>
        <div className="w-100">
          {
            !(i%2) && <Doughnut data = {{
            labels: Object.keys(q.distribution),
            datasets: [
              {
                label: "Total Responses",
                data: Object.values(q.distribution)
               }]
          }}/>
          }
          {
            (i%2) && <Bar data = {{
            labels: Object.keys(q.distribution),
            datasets: [
              {
                label: "Total Responses",
                data: Object.values(q.distribution)
               }]
          }}/>
          }
        </div>
      </div>
  )
}
else if(q.type === "multi_choice") {
  return (
  <div key={i}>
        <div>Question: {q.question}</div>
        <div>Type: {q.type}</div>
        <div className="w-100">
          {
            !(i%2) && <Doughnut data = {{
            labels: Object.keys(q.distribution),
            datasets: [
              {
                label: "Total Responses",
                data: Object.values(q.distribution)
               }]
          }}/>
          }
          {
            (i%2) && <Bar data = {{
            labels: Object.keys(q.distribution),
            datasets: [
              {
                label: "Total Responses",
                data: Object.values(q.distribution)
               }]
          }}/>
          }
          
        </div>
      </div>
  )
}
else if(q.type === "text") {
  return (
  <div key={i}>
        <div>Question: {q.question}</div>
        <div>Type: {q.type}</div>
        <div>
          Sentiment Score:<br/>
          Positive: {q.sentiment.positive}<br/>
          Neutral: {q.sentiment.neutral}<br/>
          Negative: {q.sentiment.negative}<br/>
          </div>
          <div>
            {JSON.stringify(q.theme)}
          </div>
      </div>
  )
}
else {
  return (
  <div key={i}>
        <div>Question: {q.question}</div>
        <div>Type: {q.type}</div>
      </div>
  )
}
  })}
  <div> Recommded actions: </div><br/>
  {
    actions.map((ac,i) => {
      return <div key={i}>
        <div>{ac.action}</div>
        <div>{ac.confidence}</div>
      </div>
    })
  }
</div>

  )
}

export default OutputResult