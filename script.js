"use strict";

//the function that runs it all
const makePlot = (dataset) => {
  const margin = { top: 20, bottom: 40, left: 80, right: 40 };
  const height = 500;
  const width = 800;
  const color = d3.scaleOrdinal(d3.schemeCategory10);
  /////////////////////////////////////////////////////
  let minDate = dataset[0].Year;
  minDate = new Date(minDate);

  //an array of the years
  const yearsDate = dataset.map(function (item) {
    // console.log(item);
    return new Date(item.Year);
  });

  const xAxisScale = d3
    .scaleLinear()
    .domain([d3.min(yearsDate) - 1, d3.max(yearsDate)])
    .range([0, width]);
  ///////////////////////////////////////////////////////

  var specifier = "%M:%S";

  var parsedData = dataset.map(function (d) {
    return d3.timeParse(specifier)(d.Time);
  });
  var yAxisScale = d3
    .scaleTime()
    .domain([d3.min(parsedData), d3.max(parsedData)])
    .range([height, 0]);

  /////////////////////////////////////////////////////////

  const dateFormat = d3.format("d");
  const xAxis = d3.axisBottom(xAxisScale).tickFormat(dateFormat);
  const yAxis = d3.axisLeft(yAxisScale).tickFormat(function (d) {
    return d3.timeFormat(specifier)(d);
  });

  const svg = d3
    .select(".container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "graph-svg-component")
    .append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + height + ")")
    .call(xAxis);

  svg.append("g").attr("id", "y-axis").attr("class", "y axis").call(yAxis);
  //   svg.append("g").attr("transform", "translate(0,0)").call(yAxis);

  ///////////////////////////////////////////////////////
  //tooltip

  const tooltip = d3
    .select("body")
    .append("div")

    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("padding", "4px")
    .style("background", "#fff")
    .style("border", "1px solid #000");

  const mouseoverHandler = (d, data) => {
    // console.log(data);
    const toolmarkup = `
    ${data.Name}, ${data.Nationality} <br>
    Time: ${data.Time} <br>
    Allegations: ${data.Doping ? data.Doping : "no allegations"}
    `;

    tooltip.style("opacity", 0.8);
    tooltip

      .html(toolmarkup)

      .attr("data-time", data.Time)
      .attr("data-year", data.Year);

    // d3.select(this).style("opacity", 0.1);
  };

  const mouseoutHandler = (d) => {
    tooltip.style("opacity", 0);
    d3.select("opacity", 1);
  };

  const mouseMoving = (d) => {
    const mouse = d3.pointer(d);
    tooltip
      .style("top", mouse[1] + 30 + "px")
      .style("left", mouse[0] + 130 + "px");

    // d3.select(this).style("opacity", 0.8);
  };

  ///////////////////////////////////////
  //adding dots
  svg
    .append("g")
    .selectAll("dot")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("data-xvalue", (d, i) => d.Year)
    .attr("data-yvalue", (d) => d3.timeParse(specifier)(d.Time))
    .attr("cx", (d) => xAxisScale(d.Year))
    .attr("cy", (d) => yAxisScale(d3.timeParse(specifier)(d.Time)))
    .attr("r", 7)
    .style("fill", function (d) {
      return color(d.Doping !== "");
    })
    .on("mouseover", mouseoverHandler)
    .on("mousemove", mouseMoving)
    .on("mouseleave", mouseoutHandler);
  // .style("fill", "#69b3a2");

  ///////////////////////////////////////////////////////
  //LEGEND

  var legendContainer = svg.append("g").attr("id", "legend");

  var legend = legendContainer
    .selectAll("#legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("class", "legend-label")
    .attr("transform", function (d, i) {
      return "translate(0," + (height / 2 - i * 20) + ")";
    });

  legend
    .append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legend
    .append("text")
    .attr("x", width - 44)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function (d) {
      if (d) {
        return "Riders with doping allegations";
      } else {
        return "No doping allegations";
      }
    });

  // const legendContainer = svg
  //   .append("g")
  //   .attr("id", "legend")
  //   .append("text")
  //   .text("hello");

  // const legend = legendContainer
  //   .selectAll("#legend")
  //   .data(color.domain())
  //   .enter()
  //   .append("g")
  //   .attr("class", "legend-label")
  //   .attr("transform", "translate(0, " + height / 2 + ")");

  // legend
  //   .append("rect")
  //   .attr("x", width - 20)
  //   .attr("width", 20)
  //   .attr("height", 20)
  //   .style("fill", color);

  // legend
  //   .append("text")
  //   .attr("x", width - 30)
  //   .attr("y", 9)
  //   .attr("dy", "20px")
  //   .style("text-anchor", "end")
  //   .text((d) => {
  //     if (d) {
  //       return "Riders with dopig allegations";
  //     } else {
  //       return "Riders without doping allegations";
  //     }
  //   });
};

//gets the data, and puts it into the main d3 function that runs it all
async function fetchData() {
  const res = await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
  );

  const data = await res.json();
  console.log(data);
  const dataset = data;
  makePlot(dataset);
}
fetchData();
