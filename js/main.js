loadJsonGraph('data/emissions/World.json', 'Emissions Per Capita (Metric Tons)', 'emissions-per-capita');
loadJsonGraph('data/emissions/Germany.json', 'Emissions Per Capita (Metric Tons)', 'emissions-per-capita');
loadJsonGraph('data/emissions/China.json', 'Emissions Per Capita (Metric Tons)', 'emissions-per-capita');
loadJsonGraph('data/emissions/Australia.json', 'Emissions Per Capita (Metric Tons)', 'emissions-per-capita');

loadJsonGraph('data/emissions_total/Germany.json', 'Total Emissions (in kt)', 'emissions-total');

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
