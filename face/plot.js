/*
 *
 *
 *
 */

/*    ========    SETTINGS    =========    */
var sprintf = require('sprintf-js').sprintf

var svg = d3.select('#simContainer');

var style = getComputedStyle(document.body);
var color_dc = style.getPropertyValue('--color-dc');
var color_dl = style.getPropertyValue('--color-dl');
var font_size = style.getPropertyValue('--font-size-small');

// These are strings
var width = svg.style("width");
var height = svg.style("height");

width = parseFloat(width.replace("px", ""));
height = parseFloat(height.replace("px", ""));
font_size = parseFloat(font_size.replace("px", ""));

var margin = {top: 20, right: 84, bottom: 50, left: 84};
margin.width = margin.left + margin.right;
margin.height = margin.top + margin.bottom;

// svg.append("rect")
//     .attr("x", 0)
//     .attr("y", 0)
//     .attr("width", width)
//     .attr("height", height)
//     .attr("fill", "rgba(215, 170, 246, 0.1)");

var Z_RANGE = [0.01, 10.0];   // Range of redshift values
var D_RANGE = [1.0e+1, 1.0e5];  // Range of distance [Mpc] values
var T_RANGE = [1.0e-1, 20.0];  // Range of time [Gyr] values

var NZ_GRID = 3;
var ND_GRID = 3;
var NT_GRID = 2;

/*    ========    INITIALIZE OBJECTS    =========    */

// Storage for definitions, 'defs' tells SVG they are resources
var defs = svg.append("defs");

/*    ========    FUNCTIONS    =========    */

function format(num) {
    return num.toExponential(2);
}

// == Plot / Figure Stuff == //

function initPlots() {

    var xAxisTranslate = height - margin.bottom;

    // Create a `g` called `plots` which we be clipped outside of the `mask`
    //    This is where all plotted lines should go, using:
    //    ``svg.select("#plots").append("path") ....``
    svg.append("g")
        .attr("id", "plots")
        .attr("clip-path", "url(#mask)");

    var mask = defs.append("clipPath")
        .attr("id", "mask")
        .style("pointer-events", "none")
        .append("rect")
        .attr('x', margin.left)
        .attr('y', margin.top)
        .attr('width', width - margin.width)
        .attr('height', height - margin.height);

    // == Scales and Axes == //
    axis_z = d3.axisBottom();
    axis_d = d3.axisLeft().ticks(5);
    axis_t = d3.axisRight().ticks(5);

    scale_x = d3.scaleLog();
    scale_d = d3.scaleLog();
    scale_t = d3.scaleLog();

    scale_x = scale_x.domain(Z_RANGE)
        .range([0.0, width - margin.width]);
    scale_d = scale_d.domain(D_RANGE)
        .range([height - margin.height, 0]);
    scale_t = scale_t.domain(T_RANGE)
        .range([height - margin.height, 0]);

    // add z gridlines
    svg.select("#plots").append("g")
        .attr("class", "grid")
        .attr("id", "z")
        .attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(scale_x)
            .ticks(NZ_GRID)
            .tickSize(-height)
            .tickFormat("")
        );

    // add d gridlines
    svg.select("#plots").append("g")
        .attr("class", "grid")
        .attr("id", "d")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisLeft(scale_d)
            .ticks(ND_GRID)
            .tickSize(-width)
            .tickFormat("")
        );

    // add t gridlines
    svg.select("#plots").append("g")
        .attr("class", "grid")
        .attr("id", "t")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisRight(scale_t)
            .ticks(NT_GRID)
            .tickSize(width)
            .tickFormat("")
        );

    axis_z.scale(scale_x);
    axis_d.scale(scale_d);
    axis_t.scale(scale_t);

    // d axis
    var _ax_d = svg.append("g")
        .attr("class", "axis")
        .attr("id", "axis_d")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(axis_d);

    // t axis
    var _ax_t = svg.append("g")
        .attr("class", "axis")
        .attr("id", "axis_t")
        .attr("transform", "translate(" + (width - margin.right) + "," + margin.top + ")")
        .call(axis_t);

    var _ax_z = svg.append("g")
        .attr("class", "axis")
        .attr("id", "axis_z")
        .attr("transform", "translate(" + margin.left + "," + xAxisTranslate + ")")
        .call(axis_z);

    axisLabelTens(_ax_z);
    axisLabelTens(_ax_t);
    axisLabelTens(_ax_d);

    //  ====  Add Axis Labels  ====  //

    // == Redshift Axis
    svg.append("text")
        .attr("id", "axis_z")
        .attr("transform",
            "translate(" + (width/2) + ", " + (xAxisTranslate + 40) + ")")
        .style("text-anchor", "middle")
        .style("font-size", font_size*1.2)
        .text("Redshift");

    // == Distance Axis
    svg.append("text")
        .attr("id", "axis_d")
        .attr("transform", "translate(15, " + (height/2) + ")" + "rotate(-90)")
        // .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", font_size*1.2)
        .text("Distance [Mpc]");

    // Comoving
    var temp = svg.append("text")
        .attr("id", "dc")
        .attr("transform", "translate(15, " + (height/2) + ")" + "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Comoving");

    // Shift up
    temp.attr("dx", - temp.node().getBBox().width/2 - 10)
        .attr("dy", temp.node().getBBox().height + 4)

    // Luminosity
    var temp = svg.append("text")
        .attr("id", "dl")
        .attr("transform", "translate(15, " + (height/2) + ")" + "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Luminosity");

    // Shift down
    temp.attr("dx", temp.node().getBBox().width/2 + 10)
        .attr("dy", temp.node().getBBox().height + 4)

    // == Time Axis
    svg.append("text")
        .attr("id", "axis_t")
        .attr("transform", "translate(" + (width - 15) + "," + (height/2) + ")" + "rotate(90)")
        .style("text-anchor", "middle")
        .style("font-size", font_size*1.2)
        .text("Time [Gyr]");

    // Lookback
    var temp = svg.append("text")
        .attr("id", "tl")
        .attr("transform", "translate(" + (width - 15) + "," + (height/2) + ")" + "rotate(90)")
        .style("text-anchor", "middle")
        .text("Lookback");

    // Shift up
    temp.attr("dx", -temp.node().getBBox().width/2 - 10)
        .attr("dy", temp.node().getBBox().height + 4)

    // Luminosity
    var temp = svg.append("text")
        .attr("id", "ta")
        .attr("transform", "translate(" + (width - 15) + "," + (height/2) + ")" + "rotate(90)")
        .style("text-anchor", "middle")
        .text("Universe");

    // Shift down
    temp.attr("dx", temp.node().getBBox().width/2 + 10)
        .attr("dy", temp.node().getBBox().height + 4)

}

function axisLabelTens(ax) {
    ax.selectAll(".tick text")
        .text(null)
        .filter(powerOfTen)
        .text(10)
        .append("tspan")
        .attr("dy", "-.7em")
        .text(function(d) {
            return sprintf('%+.0f', Math.round(Math.log(d) / Math.LN10));
        });
}

function powerOfTen(d) {
  return d / Math.pow(10, Math.ceil(Math.log(d) / Math.LN10 - 1e-12)) === 1;
}

function plotLines() {
    d3.csv("data/cosmo_grid.csv", function(error, data) {
        if (error) throw error;

        data.splice(-1, 1);

        // format the data
        data.forEach(function(d, i) {
            d.z = parseFloat(d.z);
            d.dc = parseFloat(d.dc);
            d.dl = parseFloat(d.dl);
            d.tl = parseFloat(d.tl);
            d.ta = parseFloat(d.ta);
        });

        // ==  Comoving Distance d_C  ==
        // define the line
        var line_dc = d3.line()
            .x(function(d) { return scale_x(d.z); })
            .y(function(d) { return scale_d(d.dc); });

        // Add the valueline path.
        svg.select("#plots").append("path")
            .data([data])
            .attr("class", "line")
            .attr("id", "dc")
            .attr("d", line_dc)
            .attr("transform", "translate(50, 50)");

        // ==  Luminosity Distance d_L  ==
        // define the line
        var line_dl = d3.line()
            .x(function(d) { return scale_x(d.z); })
            .y(function(d) { return scale_d(d.dl); });

        // Add the valueline path.
        svg.select("#plots").append("path")
            .data([data])
            .attr("class", "line")
            .attr("id", "dl")
            .attr("d", line_dl)
            .attr("transform", "translate(50, 50)");

        // ==  Lookback Time t_l  ==
        // define the line
        var line_tl = d3.line()
            .x(function(d) { return scale_x(d.z); })
            .y(function(d) { return scale_t(d.tl); });

        // Add the valueline path.
        svg.select("#plots").append("path")
            .data([data])
            .attr("class", "line")
            .attr("id", "tl")
            .attr("d", line_tl)
            .attr("transform", "translate(50, 50)");

        // ==  Universe-Age Time t_a  ==
        // define the line
        var line_ta = d3.line()
            .x(function(d) { return scale_x(d.z); })
            .y(function(d) { return scale_t(d.ta); });

        // Add the valueline path.
        svg.select("#plots").append("path")
            .data([data])
            .attr("class", "line")
            .attr("id", "ta")
            .attr("d", line_ta)
            .attr("transform", "translate(50, 50)");

    });
}

/*    ========    RUN SIMULATION    =========    */

initPlots();
plotLines();
