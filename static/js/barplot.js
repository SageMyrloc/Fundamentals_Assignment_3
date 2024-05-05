// get bracket dimmensions
var container = document.getElementById("my_dataviz");
var containerWidth = container.clientWidth;
var containerHeight = containerWidth / 2;

// Set up dimensions
var margin = { top: 20, right: 20, bottom: 30, left: 40 },
  width = containerWidth - margin.left - margin.right,
  height = containerHeight - margin.top - margin.bottom;

// Append SVG to the div
var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Parse the date
d3.csv("/static/data/Kaggle_TwitterUSAirlineSentiment.csv", function (error, data) {
  if (error) throw error;

  // X axis
  var x = d3
    .scaleBand()
    .range([0, width * 0.75])
    .domain(
      data.map(function (d) {
        return d.airline;
      })
    )
    .padding(0.2);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "middle");

  // Preprocess the data
  var airlines = d3
    .map(data, function (d) {
      return d.airline;
    })
    .keys();
  var stackedData = [];

  airlines.forEach(function (airline) {
    var airlineData = data.filter(function (d) {
      return d.airline === airline;
    });
    var counts = {
      airline: airline,
      positive: d3.sum(airlineData, function (d) {
        return d.airline_sentiment === "positive" ? 1 : 0;
      }),
      neutral: d3.sum(airlineData, function (d) {
        return d.airline_sentiment === "neutral" ? 1 : 0;
      }),
      negative: d3.sum(airlineData, function (d) {
        return d.airline_sentiment === "negative" ? 1 : 0;
      }),
    };
    stackedData.push(counts);
  });

  // Stack the data
  var keys = ["positive", "neutral", "negative"];
  var stack = d3.stack().keys(keys);
  stackedData = stack(stackedData);

  // Calculate max number of tweets for y axis
  var maxCount = d3.max(stackedData[stackedData.length - 1], function (d) {
    return d[1];
  });

  // Update y scale
  var y = d3.scaleLinear().domain([0, maxCount]).range([height, 0]);

  // Define color scale
  var color = d3.scaleOrdinal().domain(keys).range(["#2ca02c", "#ff7f0e", "#d62728"]);

  // Add Y axis
  svg.append("g").call(d3.axisLeft(y));

  // Add the bars
  svg
    .selectAll(".serie")
    .data(stackedData)
    .enter()
    .append("g")
    .attr("fill", function (d) {
      return color(d.key);
    })
    .selectAll("rect")
    .data(function (d) {
      return d;
    })
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return x(d.data.airline);
    })
    .attr("y", function (d) {
      return y(d[1]);
    })
    .attr("height", function (d) {
      return y(d[0]) - y(d[1]);
    })
    .attr("width", x.bandwidth());

  // Define legend data
  var legendKeys = ["positive", "neutral", "negative"];

  // Add legend
  var legend = svg.append("g").attr("transform", "translate(" + (width - 100) + "," + (margin.top + 10) + ")");

  // Create legend items
  legendKeys.forEach(function (key, i) {
    var legendItem = legend.append("g").attr("transform", "translate(0," + i * 20 + ")");

    legendItem.append("rect").attr("width", 18).attr("height", 18).attr("fill", color(key)); // Use color scale to assign colors

    legendItem
      .append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(key.charAt(0).toUpperCase() + key.slice(1)); // Display formatted key text
  });
});
