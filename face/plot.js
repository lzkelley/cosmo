/*
 *
 *
 *
 */

/*    ========    SETTINGS    =========    */

var svg = d3.select('#simContainer');

// These are strings
var width = svg.style("width");
var height = svg.style("height");

width = parseFloat(width.replace("px", ""));
height = parseFloat(height.replace("px", ""));

var Z_RANGE = [0.01, 10.0];   // Range of redshift values
var D_RANGE = [1.0, 10000.0];  // Range of distance [Mpc] values
// var XUNITS = 1000.0;
// var LOG_SCALE = false;

var padLR = 4;
var padTB = 4;

/*    ========    INITIALIZE OBJECTS    =========    */
// These are all set in `reset()`
var phaseInit, binary, particles, bhMassRatio, bhMassTotal, masses, separation;

// These are set in `initPlots()`
var pathStringM1, pathStringM2, lineGenM1, lineGenM2;
var xmin, xmax, ymin, ymax, xscale, yscale, xAxis, yAxis;

// Storage for definitions, 'defs' tells SVG they are resources
var defs = svg.append("defs");

/*    ========    FUNCTIONS    =========    */

function format(num) {
    return num.toExponential(2);
}

// == Plot / Figure Stuff == //

// function initCounters() {
//     var texts = svg.selectAll("text.counters")
//         .data(counterData).enter();
//
//     texts.append("rect")
//         .attr("id", function(d){ return d.name; })
//         .attr("class", "counters")
//         .attr("x", function (d, i) { return d.x; })
//         .attr("y", function (d, i) { return d.y - 20; });
//
//     texts.append("text")
//         .attr("id", function(d){ return d.name; })
//         .attr("class", "counters")
//         .attr("text-anchor", "left")
//         .attr("x", function (d, i) { return d.x; })
//         .attr("y", function (d, i) { return d.y; });
// }
//
// function updateCounters() {
//
//     texts = svgSim.selectAll("text.counters");
//
//     texts.text(function(d) { return d.name + ": " + d.num; });
//
//     // get bounding box of text field and store it in texts array
//     texts.each(function(d, i) { d.bb = this.getBBox(); });
//
//     svgSim.selectAll("rect.counters")
//         .attr("x", function(d) { return d.x - padLR/2; })
//         .attr("y", function(d) { return d.y + padTB/2 - 20;  })
//         .attr("simWidth", function(d) { return d.bb.width + padLR; })
//         .attr("simHeight", function(d) { return d.bb.height + padTB; });
// }

function initPlotScales() {
    // == Scales and Axes == //
    // Use `clamp` to avoid bounds isses when passing `0.0`
    xscale = d3.scaleLog();  //.clamp(true);
    yscale = d3.scaleLog();  //.clamp(true);

    xscale = xscale.domain(Z_RANGE)
        .range([0.0, width - 100]);
    yscale = yscale.domain(D_RANGE)
        .range([height - 100, 0]);

    xAxis.scale(xscale);
    yAxis.scale(yscale);
}

function initPlots() {

    xAxis = d3.axisBottom();
    yAxis = d3.axisLeft().ticks(5);

    var mask = defs.append("clipPath")
        .attr("id", "mask")
        .style("pointer-events", "none")
        .append("rect")
        .attr({
            x: 50,
            y: 50,
            width: width - 100,
            height: height - 100,
        });

    initPlotScales();

    svg.append("g")
        .attr("class", "axis")
        .attr("id", "yaxis")
        .attr("transform", "translate(50, 50)")
        .call(yAxis);

    var xAxisTranslate = height - 50;

    svg.append("g")
        .attr("class", "axis")
        .attr("id", "xaxis")
        .attr("transform", "translate(50, " + xAxisTranslate  +")")
        .call(xAxis);

}


function plotLines() {
    d3.csv("data/cosmo_grid.csv", function(error, data) {
        if (error) throw error;

        data.splice(-1, 1);

        // format the data
        data.forEach(function(d, i) {
            d.z = parseFloat(d.z);
            d.dc = parseFloat(d.dc);
        });

        // define the line
        var line_dc = d3.line()
            .x(function(d) { return xscale(d.z); })
            .y(function(d) { return yscale(d.dc); });

        // Add the valueline path.
        svg.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", line_dc)
            .attr("transform", "translate(50, 50)");

    });
}
/*    ========    RUN SIMULATION    =========    */


initPlots();
plotLines();
