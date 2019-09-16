var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = window.innerWidth - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

d3.csv('data/emissions.csv')
    .then((data) => {
        processData(data);
    })

function processData(data) {
    const svg = d3.select('#chart-1')
                    .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let years = d3.range(1960, 2018);
    let max = 0;
    let countries = _.uniq(_.pluck(data, 'Country Name'));
    let relevantCountries = ['Germany'];
    let lineChartData = {};
    let emissions = (_.map(data, (val, key) => {
        years.forEach(year => {
            val[year] = +val[year];
            if (relevantCountries.indexOf(val['Country Name']) >= 0) {
                if (!lineChartData[val['Country Name']]) {
                    lineChartData[val['Country Name']] = []
                }

                if (val[year] != "") {
                    lineChartData[val['Country Name']].push({
                        year,
                        value: val[year]
                    });
                }

                if (val[year] > max ) {
                    max = val[year];
                }
            }
        })
        return val;
    })).sort()

    const x = d3.scaleLinear()
                .range([0, width])
                .domain([years[0], years[years.length-1]]);

    const y = d3.scaleLinear()
                .range([0, height])
                .domain([max, 0]);

    const yAxis = d3.axisLeft(y)
                    .ticks(10);

    const xAxis = d3.axisBottom(x)
                    .ticks(30)
                    .tickFormat((d) => d.toString());
    svg
        .append('g')
        .attr('class', 'y-axis')
        .attr("transform", "translate(0, 0)")
        .call(yAxis);

    svg
        .append('g')
        .attr('class', 'x-axis')
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    const line = d3.line()
                    .x(function(d) { return x(d.year); })
                    .y(function(d) { return y(d.value); })
                    .defined((d) => d.value != "");

    svg.append('g')
        .append('path')
        .datum(lineChartData['Germany'])
        .attr('d', line);

    svg.append('g')
        .selectAll('circle')
        .data(lineChartData['Germany'])
        .enter()
        .append('circle')
        .attr('cx', (d) => x(d.year))
        .attr('cy', (d) => y(d.value))
        .attr('r', 3)
        .style('fill', 'grey');
}
