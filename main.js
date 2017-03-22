/* SETUP */
var map = L.map('map',{
    tms: false
}).setView([42.755942, -72.8092041],3);

var PersonIcon = L.Icon.extend({
    options: {
        iconSize: [
            60, 60
        ],
        className: 'circular',
        popupAnchor:  [0, -30],
    }
});

// load up the background tile layer
var Stamen_Watercolor = L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {}).addTo(map);

// all the facemarkers will go into one layer
var facemarkers = L.layerGroup();

// function to add markers
var addMarker = function(options) {
  var icon = new PersonIcon({iconUrl: options.iconUrl});
  var marker = L.marker(options.lat_long, {icon: icon, url: options.url, name: options.name, tags: [options.year]});
  facemarkers.addLayer(marker.addTo(map).bindPopup(options.message));
};


// load members json
var loadJSON = function(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'people.json');
    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(xobj.responseText);
      }
    };
    xobj.send(null);
};

// load and process members
loadJSON(function(response) {
  // Parse JSON string into object
  var members = JSON.parse(response);
  var years = [];
  Object.keys(members).forEach(function(member) {
    addMarker(members[member]);
    years.push(members[member].year);
  });
  var filterButton = L.control.tagFilterButton({
      data: years,
      icon: '<img src="filter.png">',
      filterOnEveryClick: 'true'
  }).addTo(map);

  // add all markers to a layer
  facemarkers.eachLayer(function(marker) {
    marker.on('mouseover', function (e) {
      e.target.openPopup();
    });
    marker.on('mouseout', function (e) {
      e.target.closePopup();
    });
    marker.on('click', function (e) {
      eModal.iframe({url: e.target.options.url, title: e.target.options.name, size: 'lg'});
    });
  });

});


// setup the info control layer
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this._div.innerHTML = '<a href="https://dartmouth-cs52-17S.github.io/git-map/"><h4>CS52 17S</h4></a><p><a href="https://github.com/dartmouth-cs52-17S/git-map">code on github</p></a>';
    return this._div;
};


info.addTo(map);
