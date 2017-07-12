var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
var svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var tooltip = d3.select("body")
    .append("div")
    .attr("class", "D3tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("display", "none");

var geoProjection = d3.geoMercator();
var geoPath = d3.geoPath().pointRadius(2);
var geoData;


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


    //draw_map(geoData);
    var base = svg.append("g").attr("class", "countries");
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



function show_tooltip(d, lookup, pos) {

  // Grab data for the tool tip
  var country_data = lookup[d.properties.country];
  var sel_program = country_data[pos];

  // Clear tooltip
  tooltip.html("");
  tooltip
      .style("display", "inline")
      .style("border", "3px solid #333");

  // Tooltip information
  tooltip.append("h3")
      .style('text-align', 'center')
      .text(d.properties.country);
  tooltip.append("div")
      .text("Type: " + sel_program.category);
  tooltip.append("div")
      .text("Year: " + sel_program.year);
  tooltip.append("div")
      .html("More info: <a href='" + sel_program.link + "'>Link</a>");

  // Pagination
  // conditional buttons
  //◀▶

  // Move tooltip into place
  tooltip
      .style("top", (d3.event.pageY-52) + "px")
      .style("left", (d3.event.pageX+18) + "px");


  console.log(country_data, sel_program);
}


function draw_map(data) {
  var base = svg.append("g").attr("class", "countries");
  var countries = base.selectAll("g")
      .data(data)
    .enter().append("path")
      .attr("class", "country")
      .attr("id", function(d) { return 'NM-' + d.properties.name; })
      .attr("d", geoPath);
}
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
