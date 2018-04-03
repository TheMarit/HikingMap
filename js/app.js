var map,
	trails;

function AppViewModel() {
    var self = this;
    var apiUrl = "https://www.hikingproject.com/data/get-trails?maxDistance=20&key=200240731-0449812db40864bc0f8afbc4ea29eccb&lat=41.763314&lon=-111.699597";

	var infowindow = new google.maps.InfoWindow({
			content: null,
			maxWidth: 500
		});

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
				summary: trail.summary,
				difficulty: trail.difficulty,
				stars: trail.stars,
				location: trail.location,
				url: trail.url,
				length: trail.length,
				animation: google.maps.Animation.DROP,
				infoWindow: 	`<div class="infoWindow">
									<h3>${trail.name}</h3>
									<div class="row">
										<p><strong>Difficulty:</strong> ${trail.difficulty}</p>
										<p><strong>Stars:</strong> ${trail.stars}</p>
										<p><strong>Location:</strong> ${trail.location}</p>
										<p><strong>Length:</strong> ${trail.length} miles</p>
									</div>
									
									<p class="full summary">${trail.summary}</p>
									<p class="full"><a href="${trail.url}" target="_blank">More Info...</a></p>
								</div>`
			};
			self.markerList.push(marker);
			var googleMarker = new google.maps.Marker(marker);
			self.attachEventListener(googleMarker);
		}
    };

    this.attachEventListener = function(googleMarker){
		googleMarker.addListener('click', function(){
			return self.clickedLi(googleMarker);
		});
    };

    this.clickedLi = function(clickedLi){
		infowindow.setPosition(clickedLi.position);
		infowindow.setContent(clickedLi.infoWindow);
		infowindow.open(map);
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