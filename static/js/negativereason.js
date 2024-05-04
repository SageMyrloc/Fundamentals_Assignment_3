// get div dimmensions
var container = document.getElementById("nr_dataviz");
var containerWidth = container.clientWidth;
var containerHeight = containerWidth / 2;

// Set up chart dimensions
var margin = { top: 20, right: 20, bottom: 30, left: 40 },
  width = containerWidth - margin.left - margin.right,
  height = containerHeight - margin.top - margin.bottom;

// append the svg2 object to the body of the page
var svg2 = d3
  .select("#nr_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Parse the data and create an aggregated set that contains the count for each negative reason per airline
d3.csv("/static/data/Kaggle_TwitterUSAirlineSentiment.csv", function (error, data) {
  if (error) throw error;

  // Prepare data for the grouped bar chart
  var nestedData = d3
    .nest()
    .key(function (d) {
      return d.airline;
    })
    .key(function (d) {
      return d.negative_reason;
    })
    .rollup(function (leaves) {
      return leaves.length;
    })
    .entries(data);

    // Extract airlines and filter out empty negative_reason entries
nestedData.forEach(function(airlineData) {
  airlineData.values = airlineData.values.filter(function(negReason) {
    return negReason.key !== "" && negReason.key !== null; // Filter out empty or null keys
  });
});

  console.log(nestedData);

  // Extract airlines and negative reasons from the nested data
  var airlines = nestedData.map(function (d) {
    return d.key;
  });
  var negativeReasons = nestedData[0].values.map(function (d) {
    return d.key;
  });

  // Calculate the maximum count of any negative reason across all airlines
  var maxCount = d3.max(nestedData, function (d) {
    return d3.max(d.values, function (d) {
      return d.value;
    });
  });

  // Define the color scale for negative reasons (you can customize this)
  var color = d3.scaleOrdinal().domain(negativeReasons).range(d3.schemeCategory10);

  // Define the x scale (band scale for airlines)
  var x = d3.scaleBand().domain(airlines).range([0, width]).padding(0.2);

  // Define the y scale (linear scale for counts of negative reasons)
  var y = d3
    .scaleLinear()
    .domain([0, maxCount]) // Adjust domain to include the maximum count
    .range([height, 0]);

  // Append the bars to the SVG
  svg2
    .selectAll(".bar")
    .data(nestedData)
    .enter()
    .append("g")
    .attr("class", "bar")
    .attr("transform", function (d) {
      return "translate(" + x(d.key) + ",0)";
    })
    .selectAll("rect")
    .data(function (d) {
      return d.values;
    })
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return (x.bandwidth() / 5) * negativeReasons.indexOf(d.key);
    })
    .attr("y", function (d) {
      return y(d.value);
    })
    .attr("width", x.bandwidth() / 5)
    .attr("height", function (d) {
      return height - y(d.value);
    })
    .attr("fill", function (d) {
      return color(d.key);
    });

  // Add X axis
  svg2
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  svg2.append("g").call(d3.axisLeft(y));

  // Add Y axis label
  svg2
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Count of Negative Reasons");
});
