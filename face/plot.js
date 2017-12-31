/*
 *
 *
 *
 */

/*    ========    SETTINGS    =========    */
var sprintf = require('sprintf-js').sprintf
var fs = require('fs')

var DATA_FILE_PATH = "data/cosmo_grid.csv";
var svg = d3.select('#simContainer');
var data, data_z, data_dl, data_len;
var path_dc, path_dl, path_tl, path_ta;
var line_dc, line_dl, line_tl, line_ta;
var focus;

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

var A_TICKS = [0.99, 0.9, 0.8, 0.5, 0.2, 0.05, 0.01];

var margin = {top: 40, right: 84, bottom: 50, left: 84};
// var margin = {top: 40, right: 84, bottom: 50, left: -84};
margin.width = margin.left + margin.right;
margin.height = margin.top + margin.bottom;

var Z_RANGE = [0.01, 100.0];   // Range of redshift values
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

// == Plot / Figure Initialization == //

function initPlot() {

    // Construct mask/overlay to monitor mouse over plot; and clip lines outside plot areas
    var mask = defs.append("clipPath")
        .attr("id", "mask")
        .style("pointer-events", "none")
        .append("rect")
        .attr('x', margin.left)
        .attr('y', margin.top)
        .attr('width', width - margin.width)
        .attr('height', height - margin.height)

    // Create a `g` called `plots` which we be clipped outside of the `mask`
    //    This is where all plotted lines should go, using:
    //    ``svg.select("#plots").append("path") ....``
    svg.append("g")
        .attr("id", "plots")
        .attr("clip-path", "url(#mask)");

    // == Scales and Axes == //
    axis_z = d3.axisBottom();
    axis_d = d3.axisLeft().ticks(5);
    axis_t = d3.axisRight().ticks(5);
    axis_a = d3.axisTop();

    scale_z = d3.scaleLog();
    scale_d = d3.scaleLog();
    scale_t = d3.scaleLog();

    scale_z = scale_z.domain(Z_RANGE)
        .range([0.0, width - margin.width]);
    scale_d = scale_d.domain(D_RANGE)
        .range([height - margin.height, 0]);
    scale_t = scale_t.domain(T_RANGE)
        .range([height - margin.height, 0]);

    axis_z.scale(scale_z);
    axis_a.scale(scale_z);
    axis_d.scale(scale_d);
    axis_t.scale(scale_t);

    // Convert to redshift values
    var a_ticks_z = [];
    for (var ii = 0, len = A_TICKS.length; ii < len; ii++) {
        a_ticks_z.push((1.0/A_TICKS[ii]) - 1.0);
    }
    // Set tick locations in redshift-scale, but label according to scale-factor
    console.log(A_TICKS);
    console.log(a_ticks_z);
    axis_a.tickValues(a_ticks_z)
        .tickFormat(function(d) {
            return sprintf('%.2f', 1.0/(d + 1.0));
        });

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

    // z axis
    var _ax_z = svg.append("g")
        .attr("class", "axis")
        .attr("id", "axis_z")
        .attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
        .call(axis_z);

    // a axis
    var _ax_a = svg.append("g")
        .attr("class", "axis")
        .attr("id", "axis_z")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(axis_a);

    axisLabelTens(_ax_z);
    axisLabelTens(_ax_t);
    axisLabelTens(_ax_d);

    //  ==  Add Grid Lines  ==  //
    initGridLines();

    //  ====  Add Axis Labels  ====  //
    labelAxes();

    //  ====    Add Mouse-Interaction with Plot    ====  //
    initCrossHairs();

}

function initCrossHairs() {
    focus = svg.select("#plots").append('g')

    focus.append('line')
        .attr('class', 'focusLine')
        .attr('id', 'focusLine_z');
    focus.append('line')
        .attr('class', 'focusLine')
        .attr('id', 'focusLine_dl');
    focus.append('line')
        .attr('class', 'focusLine')
        .attr('id', 'focusLine_dc');
    focus.append('line')
        .attr('class', 'focusLine')
        .attr('id', 'focusLine_tl');
    focus.append('line')
        .attr('class', 'focusLine')
        .attr('id', 'focusLine_ta');

    svg.append('rect')
        .attr('class', 'overlay')
        .attr('x', margin.left)
        .attr('y', margin.top)
        .attr('width', width - margin.width)
        .attr('height', height - margin.height)
        .on('click', function() {
            var mouse = d3.mouse(this);
            var zz = scale_z.invert(mouse[0] - margin.left);
            calcAndUpdate(zz);
        });
}

function initGridLines() {
    // add z gridlines
    svg.select("#plots").append("g")
        .attr("class", "grid")
        .attr("id", "z")
        .attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(scale_z)
            .ticks(NZ_GRID)
            .tickSize(-height + margin.height)
            .tickFormat("")
        );

    // add d gridlines
    svg.select("#plots").append("g")
        .attr("class", "grid")
        .attr("id", "d")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisLeft(scale_d)
            .ticks(ND_GRID)
            .tickSize(-width + margin.width)
            .tickFormat("")
        );

    // add t gridlines
    svg.select("#plots").append("g")
        .attr("class", "grid")
        .attr("id", "t")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisRight(scale_t)
            .ticks(NT_GRID)
            .tickSize(width - margin.width)
            .tickFormat("")
        );

}

function labelAxes() {
    // == Redshift Axis
    svg.append("text")
        .attr("id", "axis_z")
        .attr("transform",
            "translate(" + (width/2) + ", " + (height - margin.bottom + 40) + ")")
        .style("text-anchor", "middle")
        .style("font-size", font_size*1.2)
        .text("Redshift");

    // == Scalefactor Axis
    svg.append("text")
        .attr("id", "axis_z")
        .attr("transform",
            "translate(" + (width/2) + ", " + 14 + ")")
        .style("text-anchor", "middle")
        .style("font-size", font_size*1.2)
        .text("Scale Factor");

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

// == Plot / Figure Updates == //

function updateCrossHairs(retval) {
    console.log("plot.updateCrossHairs() : ", retval);
    var temp = parseFloat(retval['z']);
    xx = scale_z(temp) + margin.left;
    console.log("temp = ", temp, "xx = ", xx);
    focus.select('#focusLine_z')
        .attr('x1', xx).attr('y1', 0)
        .attr('x2', xx).attr('y2', height);

    temp = parseFloat(retval['dl'].replace(" Mpc", ""));
    yy = scale_d(temp) + margin.top;
    console.log("temp = ", temp, "yy = ", yy);
    focus.select('#focusLine_dl')
        .attr('x1', 0).attr('y1', yy)
        .attr('x2', width).attr('y2', yy);

    temp = parseFloat(retval['dc'].replace(" Mpc", ""));
    yy = scale_d(temp) + margin.top;
    console.log("temp = ", temp, "yy = ", yy);
    focus.select('#focusLine_dc')
        .attr('x1', 0).attr('y1', yy)
        .attr('x2', width).attr('y2', yy);

    temp = parseFloat(retval['tl'].replace(" Gyr", ""));
    console.log("tl = ", temp);
    yy = scale_t(temp) + margin.top;
    console.log("temp = ", temp, "yy = ", yy);
    focus.select('#focusLine_tl')
        .attr('x1', 0).attr('y1', yy)
        .attr('x2', width).attr('y2', yy);

    temp = parseFloat(retval['ta'].replace(" Gyr", ""));
    console.log("ta = ", temp);
    yy = scale_t(temp) + margin.top;
    console.log("temp = ", temp, "yy = ", yy);
    focus.select('#focusLine_ta')
        .attr('x1', 0).attr('y1', yy)
        .attr('x2', width).attr('y2', yy);

}

function loadAndPlotCosmoLines() {
    d3.csv(DATA_FILE_PATH, function(error, _data) {
        if (error) throw error;
        data = _data;
        data_z = [];
        data_dl = [];
        data_len = data.length;
        for (var ii = 0; ii < data_len; ii++) {
            data_z.push(parseFloat(data[data_len - 1 - ii].z));
            data_dl.push(parseFloat(data[data_len - 1 - ii].dl));
        }

        var transLoc = "translate(" + (margin.left) + "," + (margin.top) + ")";
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
        line_dc = d3.line()
            .x(function(d) { return scale_z(d.z); })
            .y(function(d) { return scale_d(d.dc); });

        // Add the valueline path.
        path_dc = svg.select("#plots").append("path")
            .data([data])
            .attr("class", "line")
            .attr("id", "line_dc")
            .attr("d", line_dc)
            .attr("transform", transLoc);

        // ==  Luminosity Distance d_L  ==
        // define the line
        line_dl = d3.line()
            .x(function(d) { return scale_z(d.z); })
            .y(function(d) { return scale_d(d.dl); });

        // Add the valueline path.
        path_dl = svg.select("#plots").append("path")
            .data([data])
            .attr("class", "line")
            .attr("id", "line_dl")
            .attr("d", line_dl)
            .attr("transform", transLoc);

        // ==  Lookback Time t_l  ==
        // define the line
        line_tl = d3.line()
            .x(function(d) { return scale_z(d.z); })
            .y(function(d) { return scale_t(d.tl); });

        // Add the valueline path.
        path_tl = svg.select("#plots").append("path")
            .data([data])
            .attr("class", "line")
            .attr("id", "line_tl")
            .attr("d", line_tl)
            .attr("transform", transLoc);

        // ==  Universe-Age Time t_a  ==
        // define the line
        line_ta = d3.line()
            .x(function(d) { return scale_z(d.z); })
            .y(function(d) { return scale_t(d.ta); });

        // Add the valueline path.
        path_ta = svg.select("#plots").append("path")
            .data([data])
            .attr("class", "line")
            .attr("id", "line_ta")
            .attr("d", line_ta)
            .attr("transform", transLoc);

    });
}


/*    ========    RUN   =========    */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var sleep_count = 0;
var retval = false;

function plot() {
    loadAndPlotCosmoLines();
    retval = true;
}

async function tryPlot() {
    while (retval === false) {
        console.log("File '", DATA_FILE_PATH, "' does not exist...");
        sleep_count++;
        if (sleep_count > 20) {
            console.log("Could not find data file after 20 iterations!");
            var temp = svg.append("text")
                .attr("class", "error")
                .attr("id", "loading_plot_data")
                .attr("transform",
                    "translate(" + (width/2) + ", " + (height/2) + ")")
                .style("text-anchor", "middle")
                .style("font-size", font_size*2);

            temp.append("tspan")
                .attr("x", 0)
                .attr("dy", "-40px")
                .text("Error loading plot data!");
            temp.append("tspan")
                .attr("x", 0)
                .attr("dy", "40px")
                .text("Try re-running?");
            break;
        }
        await sleep(100);
        fs.exists(DATA_FILE_PATH, (exists) => {
            if (exists && retval == false) {
                plot();
            } else {
                console.log("Waiting for data file...");
            }
        });

    }
}

initPlot();
tryPlot();
// loadAndPlotCosmoLines();
