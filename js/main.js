loadJsonGraph('data/emissions/World.json', 'emissions-per-capita');
loadJsonGraph('data/emissions_total/World.json', 'emissions-total', true, true);

loadJsonGraph('data/sector_sunburst.json', 'emissions-sector-sunburst');

loadPredictionsCsv();
setupCountryPicker();

function loadJsonGraph(url, id, newPlot=false, showlegend=true) {
  d3.json(url)
    .then((data) => {
      processData(data, id, newPlot, showlegend);
    })
}

function processData(data, id, newPlot, showlegend) {
  lineplot = document.getElementById(id);
  console.log(newPlot, id, showlegend)
  if (newPlot) {
    Plotly.newPlot(lineplot, [data],
      { showlegend: showlegend, width: "100%", legend: {
        x: 0,
        y: -0.3
      }},
      { responsive: true });
  } else {
    Plotly.plot(lineplot, [data], { showlegend: showlegend, width: "100%",legend: {
      x: 0,
      y: -0.3
    }},
    { responsive: true});
  }
}

function loadPredictionsCsv() {
  d3.csv('data/predictions_stripped.csv')
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

function assignOptions(textArray, selector) {
  for (var i = 0; i < textArray.length;  i++) {
      var currentOption = document.createElement('option');
      currentOption.text = textArray[i];
      selector.appendChild(currentOption);
  }
}

function setupCountryPicker() {
  d3.csv('data/raw/worldbank-emissions.csv')
    .then(data => {
      country_rows = _.filter(data, (d, i) => {
        return d['Country Code'] != ""
      })

      countries = _.pluck(country_rows, 'Country Name')
      countrySelector1 = document.querySelector('.countrydata1');
      countrySelector2 = document.querySelector('.countrydata2');
      userCountrySelector = document.querySelector('.usercountry');
      assignOptions(countries, countrySelector1);
      assignOptions(countries, countrySelector2);
      assignOptions(countries, userCountrySelector);

      countrySelector1.addEventListener('change', function() {
        loadJsonGraph('data/emissions/' + countrySelector1.value + '.json',
        'emissions-per-capita',
          false,
          true);
      }, false);
      countrySelector2.addEventListener('change', function() {
        loadJsonGraph('data/emissions_total/' + countrySelector2.value + '.json',
          'emissions-total',
          false,
          true);
      }, false);

      userCountrySelector.addEventListener('change', setupCountrySelector, false);
    });
}

function setupCountrySelector() {
  filename = userCountrySelector.value + '.json';
  loadJsonGraph('data/emissions/' + filename, 'emissions-per-capita');
  loadJsonGraph('data/emissions_total/' + filename, 'emissions-total', false, true);
}
