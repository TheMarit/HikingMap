var map,
	trails;

function AppViewModel() {
    var self = this;
    var apiUrl = "https://www.hikingproject.com/data/get-trails?maxDistance=20&key=200240731-0449812db40864bc0f8afbc4ea29eccb&lat=41.763314&lon=-111.699597&maxResults=30";

	var infowindow = new google.maps.InfoWindow({
			content: null,
			maxWidth: 500
		});
	this.sortText = ko.observable('Quality');
    this.markerList = ko.observableArray([]);
    this.markerListGoogle = ko.observableArray([]);
    this.distance = ko.observable("");

    this.distance.subscribe(function(newValue){return self.filterNumber(newValue);});

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
				Name: trail.name,
				summary: trail.summary,
				difficulty: trail.difficulty,
				Quality: trail.stars,
				location: trail.location,
				url: trail.url,
				Length: trail.length,
				showInList: ko.observable(true),
				animation: google.maps.Animation.DROP,
				icon: "hiker.png",
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
			self.markerListGoogle.push(googleMarker);
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

	this.sortNumber = function(prop){
		console.log(prop);
		self.sortText(prop);
        self.markerList.sort(function(a,b){return a[prop] - b[prop];});
        self.markerListGoogle().sort(function(a,b){ console.log(a); return a[prop] - b[prop];});
	};
	this.sortNumberReverse = function(prop){
		self.sortText(prop);
		self.markerList.sort(function(a,b){return a[prop] - b[prop];}).reverse();
        self.markerListGoogle().sort(function(a,b){ console.log(a); return a[prop] - b[prop];}).reverse();
	};
	this.sortName = function(prop){
		self.sortText(prop);
		self.markerList.sort(function(a,b){
			var x = a[prop].toLowerCase();
			var y = b[prop].toLowerCase();
			if (x < y) {return -1;}
			if (x > y) {return 1;}
			return 0;});
	};
	this.filterNumber = function(from, to){
		if (to == 30){
			console.log("nothing")
		}
		for (var i=0; i < self.markerListGoogle().length; i++){
			if(self.markerListGoogle()[i]["Length"] <= to && self.markerListGoogle()[i]["Length"] >= from){
				self.markerListGoogle()[i].setMap(map);
				self.markerList()[i].showInList(true);
			} else{
				self.markerListGoogle()[i].setMap(null);
				self.markerList()[i].showInList(false);
				
			}
		}
	};


	this.initMap();
	this.getTrailData();

	$("#distance_slider").ionRangeSlider({
		type: "double",
		min: 0,
		max: 30,
		from: 0,
		to: 30,
		postfix: " mi",
		max_postfix: "+",
		hide_min_max: true,
		onFinish: function (data){
			self.filterNumber(data.from, data.to);
		}
});
	
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}