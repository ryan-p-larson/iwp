var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
var svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
var g = svg.append("g");

var zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

var tooltip = d3.select("body")
    .append("div")
    .attr("class", "D3tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("display", "none");

var geoProjection = d3.geoMercator();
var geoPath = d3.geoPath().pointRadius(2);
var geoData;

svg.call(zoom);
d3.queue()
	.defer(d3.json, 'data/canonical/web-map.topojson')
	.defer(d3.csv, 'data/canonical/outreach-programs.csv')
	.awaitAll(function(err, data) {

    // Geographic data
    var mapData = data[0];
    mapData = topojson.feature(mapData, mapData.objects.collection);
    geoData = mapData.features;

    // Set projections
    geoProjection = geoProjection.fitSize([width, height], mapData);
    geoPath.projection(geoProjection);

    // Program data
    var programData = data[1];
    var geoLookup = createLookup(programData);

    // Draw data
    var base = g.append("g").attr("class", "countries");
    var countries = base.selectAll("g")
        .data(geoData)
      .enter().append("g")
        .attr("class", "country")
        .attr("id", function(d) { return 'NM-' + d.properties.name; });
    countries.append("path")
        .attr("fill", function(d) {
          return geoLookup[d.properties.country] ? '#333' : '#ddd';
        })
        .attr("d", geoPath)
        .on("click", function(d) { show_tooltip(d, geoLookup, 0); });

});

// Tooltip
function show_tooltip(d, lookup, pos) {

  // Grab data for the tool tip
  var country_data = lookup[d.properties.country];
  var sel_program = country_data[pos];

  // Clear tooltip
  tooltip.html("");
  tooltip
      .style("display", "inline")
      .style("border", "3px solid #333");
  tooltip.append

  // Tooltip information
  tooltip.append("h3")
      .style('text-align', 'center')
      .text(d.properties.name);
  tooltip.append("div")
      .html("<b>Type: </b>" + sel_program.category);
  tooltip.append("div")
      .html("<b>Year: </b>" + sel_program.year);
  tooltip.append("div")
      .html("<b>More info: </b><a href='" + sel_program.link + "'>Link</a>");

  // Pagination with conditional buttons
  var num_programs = country_data.length;
  if (num_programs > 1) {

    var button_div = tooltip.append("div");

    if (pos < num_programs-1) {
      button_div
        .append("input")
        .attr("type", "button")
        .attr("value", "▶")
        .attr("class", "D3button right")
        .on("click", function() { show_tooltip(d, lookup, pos + 1);  });
    }
    if (pos > 0) {
      button_div
        .append("input")
        .attr("type", "button")
        .attr("value", "◀")
        .attr("class", "D3button left")
        .on("click", function() { show_tooltip(d, lookup, pos - 1);  });
    }
  }

  // Move tooltip into place
  var country_centroid = geoPath.centroid(d)
  tooltip
      .style("top", (country_centroid[1]) + "px")
      .style("left", (country_centroid[0]) + "px");
}

// Zoom functions
function zoomed() {
  g.style("stroke-width", 0.3 / d3.event.transform.k + "px");
  g.attr("transform", d3.event.transform); // updated for d3 v4
}



// Data
function createLookup(data) {
  var geoLookup = d3.nest()
        .key(function(d) { return d.country; })
        .object(data);
  return geoLookup;
}
function clean_outreach(d) {
  d.year = +d.year;
  return d;
}
