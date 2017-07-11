var margin = {top: 10, right: 10, bottom: 20, left: 10},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var geoProjection = d3.geoMercator();
var geoPath = d3.geoPath().pointRadius(2);

d3.json('data/maps/countries.geo.json', function(map) {
  console.log(map.features);

  geoProjection = geoProjection.fitSize([width, height], map);
  geoPath.projection(geoProjection);

  var base = svg.append("g").attr("class", "countries");
  var countries = base.selectAll("g")
      .data(map.features)
    .enter().append("path")
      .attr("class", "country")
      .attr("d", geoPath);

});
