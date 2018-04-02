var map;

function AppViewModel() {
    var self = this;

    this.initMap = function() {
    	map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 41.763314, lng: -111.699597},
			zoom: 12
		});
	}
	this.initMap();
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}