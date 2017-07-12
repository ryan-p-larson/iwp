var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var geoProjection = d3.geoMercator();
var geoPath = d3.geoPath().pointRadius(2);
var geoData;

function draw_map(data) {
  var base = svg.append("g").attr("class", "countries");
  var countries = base.selectAll("g")
      .data(data)
    .enter().append("path")
      .attr("class", "country")
      .attr("d", geoPath);
}

d3.json('data/canonical/web-map.topojson', function(map) {
  // Convert to GeoJSON
  var geoDataFull = topojson.feature(map, map.objects.collection);
  geoData = geoDataFull.features;

  // Set projections
  geoProjection = geoProjection.fitSize([width, height], geoDataFull);
  geoPath.projection(geoProjection);
});
