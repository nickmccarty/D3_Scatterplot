// Define SVG dimensions

var svgWidth = 600;

var svgHeight = 312;

// Define chart margins

var margin = {

  top: 20,
  right: 40,
  bottom: 80,
  left: 100

};

// Define chart dimensions

var width = svgWidth - margin.left - margin.right;

var height = svgHeight - margin.top - margin.bottom;

// Append SVG to div in index.html with id "scatter"

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append chart group to SVG and reorient it

var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Define which axes to present upon initialization

var chosenYAxis = "poverty";

var chosenXAxis = "age";

// Update scales upon user selection of alternative axes

function xScale(data, chosenXAxis) {              
  
  var xLinearScale = d3
    .scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis] - 1), d3.max(data, d => d[chosenXAxis])])
    .range([0,width]);

  return xLinearScale;

};

function yScale(data, chosenYAxis) {

  var yLinearScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d[chosenYAxis])])
    .range([height, 0]);

  return yLinearScale;

};

// Create mutually exclusive axis transitions

function drawXAxis(newXScale, xAxis) {

  var bottomAxis = d3.axisBottom(newXScale);

  xAxis
    .transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;

};

function drawYAxis(newYScale, yAxis) {

  var leftAxis = d3.axisLeft(newYScale);

  yAxis
    .transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;

};

// Draw circles in new location after transition

function drawCircles(circlesGroup, centerplane, newYScale, chosenYAxis) {

  circlesGroup
    .transition()
    .duration(1000)
    .attr(centerplane, d => newYScale(d[chosenYAxis]));

  return circlesGroup;

};

// Draw state labels in new location after transition

function drawLabels(labels, plane, newYScale, chosenYAxis) {
  
  labels
    .transition()
    .duration(1000)
    .attr(plane, d => newYScale(d[chosenYAxis]));

  return labels;

};

// Update tooltip post-transition

function updateToolTip(chosenYAxis, chosenXAxis, circlesGroup) {

  if (chosenYAxis === "poverty") {
    var ylabel = "In Poverty (%): ";
  }

  else {
    var ylabel = "Income ($): ";
  }

  if (chosenXAxis === "age") {                 
    var xlabel = "Median Age (Years): ";
  }

  else {
    var xlabel = "Tobacco Users (%): ";
  }

  var toolTip = d3
    .tip()                                       
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {

      return (`${d.state}<br>${ylabel} ${d[chosenYAxis]}<br>${xlabel} ${d[chosenXAxis]}`);

    })

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {

    toolTip
      .style("display", "block")
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY + "px")
      .show(data);
    
  })
    
    .on("mouseout", function(data) {

      toolTip.hide(data);

    })

  return circlesGroup;

};

// Read in data and parse it

d3
  .csv("../static/data/data.csv")
  .then((data) => {

    data.forEach((row) => {
      
      row.abbr = row.abbr,
      row.state = row.state,
      row.poverty = +row.poverty,
      row.age = +row.age,
      row.income = +row.income,
      row.healthcare = +row.healthcare,
      row.obesity = +row.obesity,
      row.smokes = +row.smokes
      
    }); 

    var xLinearScale= xScale(data, chosenXAxis)

    var yLinearScale = yScale(data, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);

    var leftAxis = d3.axisLeft(yLinearScale);
 
    var xAxis = chartGroup
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(bottomAxis);                             

    var yAxis = chartGroup
      .append('g')
      .call(leftAxis);

    var circlesGroup = chartGroup
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xLinearScale(d[chosenXAxis]))
      .attr('cy', d => yLinearScale(d[chosenYAxis]))
      .attr('r', 10)
      .attr('fill','blue')
      .attr('stroke-width', '1')
      .attr('stroke','white')
      .attr('opacity', '.5');                         

    var circleText = chartGroup
      .selectAll(null)
      .data(data)
      .enter()
      .append('text');

    var labels = circleText
      .attr('x', d => xLinearScale(d[chosenXAxis]))
      .attr('y', d => yLinearScale(d[chosenYAxis]))
      .style('text-anchor', 'middle')
      .style('font-size', '9px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .text(d => d.abbr);                       

    var labelsGroup = chartGroup.append("g");

    var yPovlabel = labelsGroup
      .append('text')
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "poverty") 
      .classed("active", true)
      .text("In Poverty (%)");

    var yInclabel = labelsGroup
      .append('text')
      .attr("transform", "rotate(-90)")
      .attr("y", -80)
      .attr("x", 0- (height / 2))
      .attr("dy", "1em")
      .attr("value", "income") 
      .classed("inactive", true)
      .text("Median Income ($)");

    var xLabelsgroup = chartGroup.append('g');

    var xAgelabel = xLabelsgroup
      .append('text')
      .attr('x', `${width / 2}`)
      .attr('y', `${height + 40}`)
      .attr("dy", "1em")
      .attr("value", "age") 
      .classed("active", true)
      .text('Median Age (Years)');

    var xSmokerlabel = xLabelsgroup
      .append('text') 
      .attr('x', `${width / 2}`)
      .attr('y',`${height + 60}`)
      .attr("dy", "1em")
      .attr("value", "smokes") 
      .classed("inactive", true)
      .text('Tobacco Users (%)');

    var circlesGroup = updateToolTip(chosenYAxis,chosenXAxis, circlesGroup); 

    labelsGroup
      .selectAll("text")
      .on("click", function() {

        var value = d3
          .select(this)
          .attr("value");

        if (value !== chosenYAxis) {
          
          chosenYAxis = value;

          yLinearScale = yScale(data, chosenYAxis);

          yAxis = drawYAxis(yLinearScale, yAxis);

          var centerplane = 'cy';

          var plane = 'y';

          circlesGroup = drawCircles(circlesGroup,centerplane, yLinearScale, chosenYAxis);

          labels = drawLabels(labels, plane, yLinearScale, chosenYAxis);

          circlesGroup = updateToolTip(chosenYAxis, chosenXAxis, circlesGroup);

          if (chosenYAxis === "income") {

            yInclabel
              .classed("active", true)
              .classed("inactive", false);

            yPovlabel
              .classed("active", false)
              .classed("inactive", true);

          }

          else {

            yInclabel
              .classed("active", false)
              .classed("inactive", true);

            yPovlabel
              .classed("active", true)
              .classed("inactive", false);

          }

        }

      });

      xLabelsgroup
        .selectAll("text")
        .on("click", function() {

          var value = d3
            .select(this)
            .attr("value");

          if (value !== chosenXAxis) {

            chosenXAxis = value;

            xLinearScale = xScale(data, chosenXAxis);

            xAxis = drawXAxis(xLinearScale, xAxis);

            var centerplane = 'cx';

            var plane = 'x';

            circlesGroup = drawCircles(circlesGroup,centerplane, xLinearScale, chosenXAxis);

            labels = drawLabels(labels, plane, xLinearScale, chosenXAxis);

            circlesGroup = updateToolTip(chosenYAxis, chosenXAxis, circlesGroup);

            if (chosenXAxis === "smokes") {

              xSmokerlabel
                .classed("active", true)
                .classed("inactive", false);

              xAgelabel
                .classed("active", false)
                .classed("inactive", true);

            }

            else {

              xSmokerlabel
                .classed("active", false)
                .classed("inactive", true);

              xAgelabel
                .classed("active", true)
                .classed("inactive", false);

            };

          };

        });

  });
