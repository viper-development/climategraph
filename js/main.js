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
  if (newPlot) {
    Plotly.newPlot(lineplot, [data],
      { showlegend: showlegend, margin: {
        l: 20, r: 20, b: 0, t: 0, pad: 0
      }, legend: {
        x: 0, y: -0.3
      },
      xaxis: { fixedrange: true },
      yaxis: { fixedrange: true }
      },
      { responsive: true, showSendToCloud: true });
  } else {
    Plotly.plot(lineplot, [data],
      { showlegend: showlegend, margin: {
        l: 20, r: 20, b: 0, t: 0, pad: 0
      }, legend: {
        x: 0, y: -0.3
      },
      xaxis: { fixedrange: true },
      yaxis: { fixedrange: true }
      },
    { responsive: true, showSendToCloud: true });
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
      mode: 'lines',
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
      margin: {
        l: 25,
        r: 20,
        b: 0,
        t: 0,
        pad: 0
      },
      height: 700,
      xaxis: {range: [1990, 2100], fixedrange: true },
      yaxis: {range: [-10, 200], fixedrange: true },
      sliders: [{
        pad: {t: 30},
        x: 0.05,
        len: 0.95,
        transition: {duration: 500},
        steps
      }],
      legend: {
        x: 0,
        y: -0.5
      }
    },
    frames
  });

  setupPredictionChartClickListener();
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

const temperatures = {
  "No climate policies (high)": "4.8&#8451;",
  "No climate policies (low)": "4.1&#8451;",
  "Pledges (high)": "3.2&#8451;",
  "Pledges (low)": "2.6&#8451",
  "Current policies (high)": "3.7&#8451;",
  "Current policies (low)": "3.1&#8451;",
  "2C pathways (median)": "2&#8451;",
  "1.5C pathways (median)": "1.5&#8451;",
}

function setupPredictionChartClickListener() {
  showPredictionText();
  $(document).ready(function() {
    $('.slider-group > text').bind("DOMSubtreeModified",function(){
      text = $(this).text();
      showPredictionText(text);
    });
  })
}

function showPredictionText(text) {
  if (!text || !temperatures[text]) {
    text = "No climate policies (high)";
  }
  $('.prediction-scenario').html(text)
  $('.prediction-temperature').html(temperatures[text])
}

// Prevent zoom on mobile
if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
  window.document.addEventListener('touchmove', e => {
    if(e.scale !== 1) {
      e.preventDefault();
    }
  }, {passive: false});
}
