var map,
	trails;

function AppViewModel() {
    var self = this;
    var apiUrl = "https://www.hikingproject.com/data/get-trails?maxDistance=20&key=200240731-0449812db40864bc0f8afbc4ea29eccb&lat=41.763314&lon=-111.699597";
    this.markerList = ko.observableArray([]);

    this.getTrailData = function() {
		var XHR = new XMLHttpRequest();

		XHR.onreadystatechange = function(){
			if(XHR.readyState == 4 && XHR.status == 200){
				trails = JSON.parse(XHR.responseText)["trails"];
				self.createMarkers();
			}
		};
  
		XHR.open("GET", apiUrl);
		XHR.send();
    };

    this.createMarkers = function(){
		for (let trail of trails){
			var marker = {
				position: {lat: trail.latitude, lng: trail.longitude},
				map: map,
				title: trail.name,
				animation: google.maps.Animation.DROP
			};
			self.markerList.push(marker);
			new google.maps.Marker(marker);
		}
    };

    this.initMap = function() {
		map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 41.763314, lng: -111.699597},
			zoom: 11
		});
	};
	this.initMap();
	this.getTrailData();
	
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}