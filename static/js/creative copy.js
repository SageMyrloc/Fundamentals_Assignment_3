/* ways to do this
 1. add functions within the visuals function for each of the buttons passing in a variable from the button
 2. create two functions and add in the visual function before the draw graph logic, therefore 
      button 1 will call stacked bar plot function, bar plot function will call the visual function at the start
      button 2 will call the grouped bar plot function.
*/

var airlineSentiment = [];

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


function visualisation(elem) {
  // Check if SVG already exists in the container
  var svg = d3.select("#my_dataviz svg");

  if (svg.empty()) {
    // If SVG does not exist, create a new one
    var container = document.getElementById("my_dataviz");
    var containerWidth = container.clientWidth;
    var containerHeight = container.clientHeight;

    var margin = { top: 20, right: 20, bottom: 30, left: 40 },
      width = containerWidth - margin.left - margin.right,
      height = containerHeight - margin.top - margin.bottom;

    // Append SVG to the div
    svg = d3
      .select("#my_dataviz")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }
  if(elem = 1){
    stackedBarplot(svg, width, height)
  }
  else if(elem = 2){
    groupBarplot(svg, width, height)
  }

}

function stackedBarplot(svg, width, height){
  
  //var svg = d3.select("#my_dataviz");
  var x = d3
    .scaleBand()
    .range([0, width * 0.75])
    .domain(
      airlineSentiment.map(function (d) {
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
}

function groupedBarplot(svg, width, height){
  console.log("grouped chart")
}

function createGraph(elem) {
  if ((elem = 1)) {
    visualisation(elem);
  } else if ((elem = 2)) {
    visualisation(elem);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Call functions after the DOM is fully loaded
  // Sort the data ready to be used within the charts
  datasort();
});
