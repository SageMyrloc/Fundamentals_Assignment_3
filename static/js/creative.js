var airlineSentiment = [];
console.log(airlineSentiment);

function datasort() {
  d3.csv("/static/data/Kaggle_TwitterUSAirlineSentiment.csv", function (error, data) {
    if (error) throw error;

    // Preprocess the data
    var airlines = d3
      .map(data, function (d) {
        return d.airline;
      })
      .keys();

    airlines.forEach(function (airline) {
      var airlineData = data.filter(function (d) {
        return d.airline === airline;
      });

      // Initialize an object to store counts dynamically
      var counts = {
        airline: airline,
        sentimentCounts: {}, // Object to store sentiment counts dynamically
        negativeReasons: {}, // Object to store negative reasons counts dynamically
      };

      // Loop through the airlineData to count sentiment categories and negative reasons dynamically
      airlineData.forEach(function (d) {
        var sentiment = d.airline_sentiment;
        var reason = d.negative_reason; // Use 'negative_reason' column for negative reasons

        // Count sentiment categories dynamically
        if (sentiment in counts.sentimentCounts) {
          counts.sentimentCounts[sentiment]++;
        } else {
          counts.sentimentCounts[sentiment] = 1;
        }

        // Count negative reasons dynamically (only when sentiment is 'negative')
        if (sentiment === "negative") {
          if (reason in counts.negativeReasons) {
            counts.negativeReasons[reason]++;
          } else {
            counts.negativeReasons[reason] = 1;
          }
        }
      });

      // Push counts to airlineSentiment array
      airlineSentiment.push(counts);
    });
  });
}

// Create a new SVG within the specified container
function createSVG(container) {
  // set the dimmensions
  var containerWidth = container.node().clientWidth;
  var containerHeight = container.node().clientHeight;

  var margin = { top: 20, right: 20, bottom: 40, left: 40 },
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom;

  // Append SVG to the container
  var svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  return svg;
}

function clearSVG(svg) {
  // Remove all elements within the SVG
  d3.select("svg").remove();
}

function stackedBarPlot() {
  var svgContainer = d3.select("#my_dataviz");
  svg = svgContainer.select("svg");

  // check if the SVG for the graph is create and if not create
  // if created clear the SVG
  if (svg.empty()) {
    svg = createSVG(svgContainer);
  } else {
    clearSVG(svg);
    svg = createSVG(svgContainer);
  }

  // extract the data
  const airlineNames = airlineSentiment.map((airlineObj) => airlineObj.airline);

  // get the container width for sizing the graph
  var containerWidth = parseInt(svgContainer.style("width"), 10);
  var containerHeight = parseInt(svgContainer.style("height"), 10);

  // create the x axis
  var xScale = d3
    .scaleBand()
    .range([0, containerWidth * 0.6])
    .domain(airlineNames)
    .padding(0.2);

  // add the x axis
  svg
    .append("g")
    .attr("transform", "translate(50," + (containerHeight - 150) + ")")
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("text-anchor", "middle")
    .style("font-size", "18px");

  // add the x axis label
  svg
    .append("text")
    .attr("x", 550)
    .attr("y", containerHeight - 90)
    .attr("text-anchor", "middle")
    .text("Airlines")
    .style("font-size", "30px");

  // Create the Y axis
  var yScale = d3
    .scaleLinear()
    .domain([0, 50])
    .range([containerHeight - 150, 0]);
  // add the Y axis
  svg
    .append("g")
    .attr("transform", "translate(5" + 0 + ")")
    .call(d3.axisLeft(yScale))
    .style("font-size", "18px");

  // add Y label
  svg.append("text").attr("x", -400).attr("y", 0).attr("text-anchor", "middle").attr("transform", "rotate(-90)").text("Number of Reviews").style("font-size", "30px");

  // Define colour scale for the stack
  const colour = d3.scaleOrdinal().domain(["positive", "neutral", "negative"]).range(["#39AD48", "#EEDC5B", "#a43737"]);

  // extract the data for the stacks
  const stackedData = airlineSentiment.map((airline) => {
    return {
      airline: airline.airline,
      positive: airline.sentimentCounts.positive,
      neutral: airline.sentimentCounts.neutral,
      negative: airline.sentimentCounts.negative,
    };
  });

  // create the keys
  const keys = ["positive", "neutral", "negative"];
  // create the stack
  var stack = d3.stack().keys(keys);
  const stackedSeries = stack(stackedData);
  const baroffset = 60;

  svg
    .append("g")
    .selectAll("g")
    .data(stackedSeries)
    .enter()
    .append("g")
    .attr("class", "stack")
    .attr("fill", (d) => colour(d.key))
    .selectAll("rect")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.data.airline) + baroffset)
    .attr("y", (d) => yScale(d[1]))
    .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
    .attr("width", xScale.bandwidth() * 0.75)
    .style("stroke", "black")
    .style("stroke-width", 1);

  // Add legend
  var legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (containerWidth - 500) + "," + 0 + ")");

  // Create legend items
  keys.forEach(function (key, i) {
    var legendItem = legend.append("g").attr("transform", "translate(0," + i * 20 + ")");

    legendItem.append("rect").attr("width", 20).attr("height", 20).attr("fill", colour(key)).style("stroke", "black").style("stroke-width", 1);

    legendItem
      .append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(key.charAt(0).toUpperCase() + key.slice(1));
  });

   // finally add a title to the graph
   svg.append("text")
   .attr("x", (containerWidth * 0.35 ))             
   .attr("y", 0)
   .attr("text-anchor", "middle")  
   .style("font-size", "30px") 
   .style("text-decoration", "bold")  
   .text("Stacked Graph showing review type sorted by Airline");
}

function groupedBarPlot() {
  var svgContainer = d3.select("#my_dataviz");
  svg = svgContainer.select("svg");

  if (svg.empty()) {
    svg = createSVG(svgContainer);
  } else {
    clearSVG(svg);
    svg = createSVG(svgContainer);
  }

  // extract the data
  const airlineNames = airlineSentiment.map((airlineObj) => airlineObj.airline);
  const negativeReasons = Array.from(new Set(airlineSentiment.flatMap((d) => Object.keys(d.negativeReasons))));

  // get the container width for sizing the graph
  var containerWidth = parseInt(svgContainer.style("width"), 10);
  var containerHeight = parseInt(svgContainer.style("height"), 10);

  // Create the Y axis
  var yScale = d3
    .scaleLinear()
    .domain([0, 15])
    .range([containerHeight - 150, 0]);

  // add the Y axis
  svg
    .append("g")
    .attr("transform", "translate(5" + 0 + ")")
    .call(d3.axisLeft(yScale))
    .style("font-size", "18px");

  // add Y label
  svg.append("text").attr("x", -400).attr("y", 0).attr("text-anchor", "middle").attr("transform", "rotate(-90)").text("Number of Reviews").style("font-size", "30px");

  // create the x axis
  var xScaleAirline = d3
    .scaleBand()
    .range([0, containerWidth * 0.6])
    .domain(airlineNames)
    .padding(0.2);

  // define the x-scale for reasons
  var xScaleReasons = d3.scaleBand().range([0, xScaleAirline.bandwidth()]).domain(negativeReasons).padding(0.05);

  // add the x axis
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(50," + (containerHeight - 150) + ")")
    .call(d3.axisBottom(xScaleAirline))
    .selectAll("text")
    .style("text-anchor", "middle")
    .style("font-size", "18px");

  // colour scheme for the bars
  const colourScale = d3.scaleOrdinal().domain(negativeReasons).range(d3.schemeCategory10);

  const groupShift = 56;
  // Render grouped bars for negative reasons
  svg
    .selectAll(".group")
    .data(airlineSentiment)
    .enter()
    .append("g")
    .attr("class", "group")
    .attr("transform", (d) => `translate(${xScaleAirline(d.airline) + groupShift} , 0)`)
    .selectAll("rect")
    .data((d) => negativeReasons.map((reason) => ({ airline: d.airline, reason, count: d.negativeReasons[reason] })))
    .enter()
    .append("rect")
    .attr("x", (d) => xScaleReasons(d.reason))
    .attr("y", (d) => yScale(d.count))
    .attr("width", xScaleReasons.bandwidth())
    .attr("height", (d) => yScale(0) - yScale(d.count))
    .attr("fill", (d) => colourScale(d.reason))
    .style("stroke", "black")
    .style("stroke-width", 1);

  // add the x axis label
  svg
    .append("text")
    .attr("x", 550)
    .attr("y", containerHeight - 90)
    .attr("text-anchor", "middle")
    .text("Airlines")
    .style("font-size", "30px");

  // Add legend
  var legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (containerWidth - 500) + "," + 0 + ")");

  // Create legend items
  negativeReasons.forEach(function (key, i) {
    var legendItem = legend.append("g").attr("transform", "translate(0," + i * 20 + ")");

    legendItem.append("rect").attr("width", 20).attr("height", 20).attr("fill", colourScale(key)).style("stroke", "black").style("stroke-width", 1);

    legendItem
      .append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(key.charAt(0).toUpperCase() + key.slice(1));
  });

  // finally add a title to the graph
  svg.append("text")
        .attr("x", (containerWidth * 0.35 ))             
        .attr("y", 0)
        .attr("text-anchor", "middle")  
        .style("font-size", "30px") 
        .style("text-decoration", "bold")  
        .text("Reasons for negative reviews grouped by Airline");
}

document.addEventListener("DOMContentLoaded", function () {
  // Call datasort after the DOM is fully loaded
  datasort();
  // Assign event listeners to buttons
  document.getElementById("stackedButton").addEventListener("click", stackedBarPlot);
  document.getElementById("groupedButton").addEventListener("click", groupedBarPlot);
});
