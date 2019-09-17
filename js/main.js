loadJsonGraph('data/emissions/World.json', 'Emissions Per Capita (Metric Tons)', 'emissions-per-capita');
loadJsonGraph('data/emissions/Germany.json', 'Emissions Per Capita (Metric Tons)', 'emissions-per-capita');
loadJsonGraph('data/emissions/China.json', 'Emissions Per Capita (Metric Tons)', 'emissions-per-capita');
loadJsonGraph('data/emissions/Australia.json', 'Emissions Per Capita (Metric Tons)', 'emissions-per-capita');

loadJsonGraph('data/emissions_total/Germany.json', 'Total Emissions (in kt)', 'emissions-total');

loadJsonGraph('data/sector_sunburst.json', 'Emissions in tonnes per year from 2010', 'emissions-sector-sunburst');

loadPredictionsCsv();

function loadJsonGraph(url, title, id) {
  d3.json(url)
    .then((data) => {
      processData(data, title, id);
    })
}

function processData(data, title, id) {
  lineplot = document.getElementById(id);
	Plotly.plot(lineplot, [data], {title: title, showlegend: true});
}

function loadPredictionsCsv() {
  d3.csv('data/raw/predictions.csv')
    .then((data) => {
      let columns = Object.keys(data[0]);
      columns.splice(0, 3);
      let steps = [];
      let frames = [];
      flattened_data = {};
      columns.forEach(column => {

        flattened_data[column] = _.pluck(data, column);

        steps.push({
          name: column,
          label: column,
          method: 'animate',
          args: [[column], {
            mode: 'immediate',
            frame: {redraw: false, duration: 500},
            transition: {duration: 500}
          }]
        })

        frames.push({
          name: column,
          data: [{
            y: flattened_data[column],
            'line.color': 'blue'
          }]
        })
      })
      plotGraph(steps, frames);
    });
}

function plotGraph(steps, frames) {
  predictionLinePlot = document.getElementById('prediction');
  Plotly.plot(predictionLinePlot, {
    data: [{
      name: 'Projection',
      x: d3.range(1990, 2100),
      y: flattened_data['No climate policies (high)'],
      mode: 'lines+markers',
      line: {
        color: 'blue',
        simplify: false,
      }
    },
    {
      name: 'Historic',
      x: d3.range(1990, 2100),
      y: flattened_data['Historic'],
      mode: 'lines+markers',
      line: {
        color: 'black',
        simplify: false,
      }
    }],
    layout: {
      height: 700,
      xaxis: {range: [1990, 2100]},
      yaxis: {range: [-200, 200]},
      sliders: [{
        pad: {t: 30},
        x: 0.05,
        len: 0.95,
        transition: {duration: 500},
        steps
      }],
    },
    frames
  });
}
