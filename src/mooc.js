/*
	IWP MOOC Source
*/

// Variables
var format_legend = d3.format(".5f");

var color_scale = d3.scaleThreshold().range(['#eff3ff','#bdd7e7','#6baed6','#3182bd','#08519c']);
var percentile_scale = d3.scaleQuantile().range(Array.from(Array(100),(val,index)=>index));
var radius_scale = d3.scaleQuantile().range([5, 8, 12, 16, 21]);

var lookup_page = {
	"all": "All Classes",
	"poetry-and-plays-2017": 'Power of the Pen: Identities and Social Issues in Poetry and Plays',
	"fiction-and-nonfiction-2017": 'Power of the Pen: Identities and Social Issues in Fiction and Nonfiction',
	"how-writers-write-fiction-2016": 'How Writers Write Fiction 2016: Storied Women',
	"flash-write-2016": '#Flashwrite Teen Poetry',
	"how-writers-write-fiction-2015": 'How Writers Write Fiction 2015',
	"whitman-2016": 'Whitman’s Civil War: Writing and Imaging Death, Loss, and Disaster'
};
var lookup_metric = {
	'new_users': 'New Users (# users creating an account)',
	'new_users_rate': 'New Users Rate (adjusted by country population)',
	'uniq_pg_views': 'Unique Page Views (# distinct page views)',
	'uniq_pg_views_rate': 'Unique Page Views Rate (adj. by pop.)',
	'pg_views': 'Total Page Views',
	'pg_views_rate': 'Total Page Views Rate (adj. by pop.)',
};
var lookup_link = {
	// All
	'All Classes':																															'https://iwp.uiowa.edu/iwp-courses/distance-learning-courses/moocs',
  // 2017
  'Power of the Pen: Identities and Social Issues in Fiction and Nonfiction': 'https://iwp.uiowa.edu/page/power-of-the-pen-2017-moocs',
  'Power of the Pen: Identities and Social Issues in Poetry and Plays':       'https://iwp.uiowa.edu/page/power-of-the-pen-2017-moocs',
  // 2016
  'How Writers Write Fiction 2016: Storied Women':                            'https://iwp.uiowa.edu/iwp-courses/distance-learning-courses/fall-2016/fiction-2016',
  'Whitman’s Civil War: Writing and Imaging Death, Loss, and Disaster':       'http://iwp.uiowa.edu/whitman-2016',
  '#Flashwrite Teen Poetry':                                                  'http://iwp.uiowa.edu/flashwrite',
  // 2015
  'How Writers Write Fiction 2015':                                           'http://iwp.uiowa.edu/iwp-courses/distance-learning-courses/fall-2015/how-writers-write-fiction',
  'Nonfiction Writing Seminar with Elena Passarello':                         'http://iwp.uiowa.edu/iwp-courses/distance-learning-courses/upcoming-courses/nonfiction-seminar-passarello',
  'Nonfiction Writing Seminar with Amy Leach':                                'http://iwp.uiowa.edu/iwp-courses/distance-learning-courses/upcoming-courses/nonfiction-seminar-leach',
  'How Writers Write Poetry 2015':                                             '#'
};

var style_settings = {
	stroke: '#000000',
	normal: {
		weight: 1,
		fillOpacity: 0.7
	},
	highlight: {
		weight: 2,
		fillOpacity: 0.9
	}
};

// Functions
function init_map(color) {
	/*
	Function to create a basic map. Returns a Leaflet map instance
	Color -- 'Gray' or 'DarkGray'
	*/
	var map = L.map('mapDiv', {
			attributionControl: false,
			zoomControl: false})
		.setView([29, -3.5], 2);
	L.esri.basemapLayer(color, {minZoom: 2, maxZoom: 7}).addTo(map);
	
	return map;
}

// Functions
function format_leaflet_pt(d) {

	// Use a variable to hold our temp data
	var pt = d;
	// Leaflet expects a different format of lat, lng
	pt.geometry.coordinates = pt.geometry.coordinates.reverse();

	var mouseover = function(e) {
			var layer = e.target;
	    layer.setStyle({weight: style_settings.highlight.weight, fillOpacity: style_settings.highlight.fillOpacity});
	    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) layer.bringToFront();
	};
	var mouseout = function(e) {
			var layer = e.target;
	    layer.setStyle({weight: style_settings.normal.weight, fillOpacity: style_settings.normal.fillOpacity});
			if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) layer.bringToBack();
	};

	// popup
	var pt_opts = {
		// Stroke
		'color': style_settings.stroke,
		'opacity': style_settings.normal.fillOpacity,
		'weight': style_settings.normal.weight,
		// Fill
		'fillOpacity': style_settings.normal.fillOpacity,
		// Other
		'radius': 7
	};
	var popup_text = "<h5><strong>Country Information</strong></h5>" +
			"<b>Location: </b>" + pt.properties.name + "<br>";

	var marker = L.geoJson(pt, {
			pointToLayer: function(feature) {
				return new L.circleMarker(feature.geometry.coordinates, pt_opts);
			},
			onEachFeature: function(feature, layer) {
				layer.on({
					mouseover: mouseover,
					mouseout: mouseout
				});
			}
		})
		.bindPopup(popup_text)
		.addTo(leafletMap);
	return marker;
}

function get_country_metric(data, mooc, metric, yr_min, yr_max) {
	var filtered = data
			.filter((d) => { return (d.year >= yr_min) && (d.year <= yr_max); })
			.filter((d) => {
				if (mooc === 'all') return d;
				else return d.page === mooc;
			});
	var metric_sum = d3.sum(filtered, (d) => { return d[metric]; });
	return metric_sum;
}

function set_scales(values) {
	// remove the zeroes
	var filt_values = values.filter((d) => { return d > 0; });
	// Clustering classes
	var ck = ss.ckmeans(filt_values, 5).map(function(cluster) {return cluster[0];});
	// Set scales
	color_scale.domain(ck);
	radius_scale.domain(ck);
	percentile_scale.domain(filt_values);
}

function update_map(mooc, metric, yr_min, yr_max) {

	// Extract the features from our feature layer
	var features = feature_layer.map((d) => { return d.getLayers()[0]['feature']; });

	// Calc the data for each country
	var sums = feature_layer.map((d) => {
		var feature_data = d.getLayers()[0]['feature'].properties.classes;
		return get_country_metric(feature_data, mooc, metric, yr_min, yr_max);
	});

	// Set color scales
	set_scales(sums);

	// Set legend
	legend.update(mooc, metric, yr_min, yr_max);

	function set_country_style(data) {
		var feature_data= data.getLayers()[0]['feature'].properties.classes;
		var country_measure = get_country_metric(feature_data, mooc, metric, yr_min, yr_max);
		var opac = (country_measure > 0) ? 0.75 : 0;
		return {
			// Stroke
			'color': style_settings.stroke,
			'opacity': opac,
			'weight': style_settings.normal.weight,
			// Fill
			'fillColor': color_scale(get_country_metric(feature_data, mooc, metric, yr_min, yr_max)),
			'fillOpacity': opac,
			// radius
			'radius': radius_scale(get_country_metric(feature_data, mooc, metric, yr_min, yr_max))
		}
	};
	function set_country_popup(data) {
		var feature_props = data.getLayers()[0]['feature'].properties;
		var feature_data = feature_props.classes;
		var feature_measure = get_country_metric(feature_data, mooc, metric, yr_min, yr_max);

		var popup_template = "<strong>{name} Information</strong><br/>" +
				"There are <strong>{measure}</strong> {metric} for <i>{mooc}</i> between {start} and {end}." +
				"This is the {percentile}th percentile for the current filters." +
				"<hr>" +
				"Click <a target='_blank' href='{linked}'><b>here</b></a> to go to the course's webpage.";
		var popup_data = {
			name: feature_props.name,
			measure: feature_measure,
			percentile: percentile_scale(feature_measure),
			metric: lookup_metric[metric].toLowerCase(),
			mooc: lookup_page[mooc],
			start: yr_min,
			end: yr_max,
			linked: lookup_link[lookup_page[mooc]]
		};

		var popup_content = L.Util.template(popup_template, popup_data);
		return popup_content;
	};

	feature_layer.map((d) => {
		d
			.setStyle(set_country_style(d))
			.bindPopup(set_country_popup(d));
	});
}

// Controls
L.Control.FilterBase = L.Control.extend({
	options: {position: 'bottomleft', label: 'Filter Label'},

	initialize: function (options) {
		L.Util.setOptions(this, options);
	},

	onChange: function(e) {
		L.DomEvent.preventDefault(e);

		// Filter Values
		var mooc_val = d3.select('.filter--class select').node().value;
		var metric = d3.select('.filter--metric select').node().value;

		var years = slider.get();
		var year_min = +years[0].slice(0, -3);
		var year_max = +years[1].slice(0, -3);

		// Ship them off the our update function!
		update_map(mooc_val, metric, year_min, year_max);
	}
});
// Classes
var FilterClass = L.Control.FilterBase.extend({
	options: {label: "MOOC: "},
	onAdd: function (map) {
		// Create neccesary HTML
		var container = L.DomUtil.create('div', 'filterBase filter--class');
		this.form = L.DomUtil.create('form', 'form', container);
		var group = L.DomUtil.create('div', 'form-group', this.form);

		// Label for select
		var label = L.DomUtil.create('h5', 'filter--label', group);
		label.innerText = this.options.label;

		// Add select tag
		var select = L.DomUtil.create('select', 'form-control', group);
		// Programatically add options from our classes
		d3.entries(lookup_page).forEach(function(d) {
			var option = L.DomUtil.create('option', 'small', select);
			option.value = d.key;
			option.text = d.value;
		});

		// Add listener
		L.DomEvent.addListener(select, 'change', this.onChange, this);
		L.DomEvent.disableClickPropagation(container);
		return container;
	}
});
// Metrics
var FilterMetric = L.Control.FilterBase.extend({
	options: {label: "Metric: "},
	onAdd: function (map) {
		// Create neccesary HTML
		var container = L.DomUtil.create('div', 'filterBase filter--metric');
		this.form = L.DomUtil.create('form', 'form', container);
		var group = L.DomUtil.create('div', 'form-group', this.form);

		// Label for select
		var label = L.DomUtil.create('h5', 'filter--label', group);
		//label.innerHTML = this.options.label + "<button type='button' class='btn btn-default btn-sm' data-toggle='modal' data-target='#myModal'>" +
		  "<span class='glyphicon glyphicon-alert' aria-hidden='true'></span></button>";
		label.innerText = this.options.label;

		// Add select tag
		var select = L.DomUtil.create('select', 'form-control', group);
		// Programatically add options from our metrics
		d3.entries(lookup_metric).forEach(function(d) {
			var option = L.DomUtil.create('option', 'small', select);
			option.value = d.key;
			option.text = d.value;
		});

		// Add listener
		L.DomEvent.addListener(select, 'change', this.onChange, this);
		L.DomEvent.disableClickPropagation(container);
		return container;
	}
});
// Years
var FilterYear = L.Control.FilterBase.extend({
	options: {label: "Year: "},
	onAdd: function (map) {
		// Create neccesary HTML
		var container = L.DomUtil.create('div', 'filterBase filter--year');

		// Label
		var label = L.DomUtil.create('h5', 'filter--label', container);
		label.innerText = this.options.label;

		// Slider!
		var sliderDiv = L.DomUtil.create('div', 'filter--slider', container);
		slider = noUiSlider.create(sliderDiv, {
			range: {'min': [2015], 'max': [2017]},
			start: [2015, 2017],
			pips: {
				mode: 'values',
				values: [2015, 2016, 2017],
				density: 40
			},
			connect: true,
			step: 1
		});

		// Add listener
		slider.on('set', this.onChange);
		// Prevent sliding from making the map move
		L.DomEvent.disableClickPropagation(container);

		return container;
	}
});
// Legend
var FilterLegend = L.Control.extend({
	options: {position: 'bottomright', label: 'Filter Label'},
	initialize: function (options) {
		L.Util.setOptions(this, options);
	},
	onAdd: function(map) {
			this._div = L.DomUtil.create('div', 'legend');
			return this._div;
	},
	update:	 function(mooc_val, metric, year_min, year_max) {
		var legend_html = "<h5 class='filter--label'>Legend</h5>";
		var domain = color_scale.domain();

		for (var i=0; i<domain.length; i++) {
			var legend_val = (domain[i] % 1 === 0) ? domain[i]: format_legend(domain[i]);
			var legend_next = (domain[i + 1] % 1 === 0) ? domain[i]: format_legend(domain[i]);
			var legend_entry = "<i style='";

			legend_entry += "background:" + color_scale(domain[i]) + ";";
			legend_entry += "width:" +  radius_scale(domain[i]) + "px;";
			legend_entry += "height:" +  radius_scale(domain[i]) + "px;";
			legend_entry += "border-radius:" + (radius_scale(domain[i]) / 2) + "px;"
			legend_entry += "'></i> " + legend_val + (domain[i + 1] ? '&ndash;' + legend_next + '<br>' : '+');

			legend_html += legend_entry;
		}
		this._div.innerHTML = legend_html;
	}
});
// Leaflet title
var Title = L.Control.extend({
	options: {position: 'topleft'},
	initialize: function (options) {
		L.Util.setOptions(this, options);
	},
	onAdd: function(map) {
		var div = L.DomUtil.create('div', 'mapTitle');
		div.innerHTML += '<h2>IWP MOOC Engagement</h2>';
		return div;
	}
});
