var map,
	trails;

function AppViewModel() {
    var self = this;
	var infowindow = new google.maps.InfoWindow({
			content: null,
			maxWidth: 500
		});
	this.sortText = ko.observable('Quality');
	this.distance = ko.observable("17");
	this.lat = ko.observable("41.763314");
	this.lng = ko.observable("-111.699597");
    this.markerList = ko.observableArray();
    this.searchField = ko.observable("");
    this.difficultyArr = ["green", "greenBlue", "blue", "blueBlack", "black"];
    this.searchField.subscribe(function(newValue){return self.runAllFilters(newValue);});
    this.apiUrl = ko.computed(function(){
		return "https://www.hikingproject.com/data/get-trails?maxDistance=" + self.distance() + "&key=200240731-0449812db40864bc0f8afbc4ea29eccb&lat=" + self.lat() + "&lon=" + self.lng() + "&maxResults=50";
    });
    this.apiUrl.subscribe(function(){
		self.getHikes();
    });
    
    this.getHikes = function(){
		return self.getTrailData()
		.then(function(response){
			return response.json();
		}).then(function(response){
			trails = response["trails"];
		}).then( function(){
			return self.clearMarkers();
		}).then(function(){
			self.createMarkers();
		}).then(function(){
			self.runAllFilters();
		});
    };

    this.getTrailData = function() {
		return fetch(self.apiUrl());
    };

    this.clearMarkers = function(){
		return new Promise (function(resolve){
			for (var i = 0; i < self.markerList().length; i++ ) {
				self.markerList()[i]().setMap(null);
			}
			self.markerList.removeAll();
			resolve();
		});
    };

    this.createMarkers = function(){
		for (let trail of trails){
			var marker = {
				position: {lat: trail.latitude, lng: trail.longitude},
				map: map,
				Name: trail.name,
				summary: trail.summary,
				Difficulty: trail.difficulty,
				Quality: trail.stars,
				location: trail.location,
				url: trail.url,
				Length: trail.length,
				showInList: ko.observable(true),
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
			var googleMarker = new google.maps.Marker(marker);
			self.markerList.push(ko.observable(googleMarker));
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
		map.addListener('dragend', function(){
			var center = map.getCenter();
			self.lat(center.lat());
			self.lng(center.lng());
		});
		map.addListener('zoom_changed', function(){
			var bounds = map.getBounds();
			var swLat = bounds.getSouthWest().lat(); 
			var neLat = bounds.getNorthEast().lat();
			var swLng = bounds.getSouthWest().lng();
			var firstPoint = new google.maps.LatLng(swLat, swLng);
			var secPoint = new google.maps.LatLng(neLat, swLng);
			var proximitymeter = google.maps.geometry.spherical.computeDistanceBetween (firstPoint, secPoint);
			var proximity = Math.round(proximitymeter * 0.000621371192 / 2) -5;
			self.distance(proximity);

			var center = map.getCenter();
			self.lat(center.lat());
			self.lng(center.lng());
		});
	};
	this.sortNumber = function(prop){
		self.sortText(prop);
        self.markerList.sort(function(a,b){return a()[prop] - b()[prop];});
	};
	this.sortNumberReverse = function(prop){
		self.sortText(prop);
        self.markerList.sort(function(a,b){return a()[prop] - b()[prop];}).reverse();
	};
	this.sortName = function(prop){
		self.sortText(prop);
		self.markerList.sort(function(a,b){
			var x = a()[prop].toLowerCase();
			var y = b()[prop].toLowerCase();
			if (x < y) {return -1;}
			if (x > y) {return 1;}
			return 0;});
	};
	this.sortDiff = function(){
		self.sortText("Difficulty");
		self.markerList.sort(function(a,b){
			var indexA = self.difficultyArr.indexOf(a().Difficulty);
			var indexB = self.difficultyArr.indexOf(b().Difficulty);
			if (indexA < indexB) {return -1;}
			if (indexA > indexB) {return 1;}
			return 0;
		});
		
	};
	this.filterNumber = function(from, to, prop){
		for (var i=0; i < self.markerList().length; i++){
			if(self.markerList()[i]()[prop] > to || self.markerList()[i]()[prop] < from){
				self.markerList()[i]().setMap(null);
				self.markerList()[i]().showInList(false);
			}
		}
	};
	this.filterDiff = function(from, to){
		for (var i=0; i < self.markerList().length; i++){
			var diff = self.markerList()[i]().Difficulty;
			var index = self.difficultyArr.indexOf(diff);
			if( index > to || index < from){
				self.markerList()[i]().setMap(null);
				self.markerList()[i]().showInList(false);
			} 
		}
	};
	this.search = function(searchString){
		for (var i=0; i < self.markerList().length; i++){
			var search = searchString.toLowerCase();
			var name = self.markerList()[i]().Name.toLowerCase();
			if( name.indexOf(search) == -1){
				self.markerList()[i]().setMap(null);
				self.markerList()[i]().showInList(false);
			} 
		}
	};
	this.runAllFilters = function(searchString) {
		searchString = searchString || "";
		for (var i=0; i < self.markerList().length; i++){
			self.markerList()[i]().setMap(map);
			self.markerList()[i]().showInList(true);
		}
		self.filterNumber($("#distance_slider").data("ionRangeSlider").result.from,$("#distance_slider").data("ionRangeSlider").result.to, "Length");
		self.filterNumber($("#star_slider").data("ionRangeSlider").result.from,$("#star_slider").data("ionRangeSlider").result.to, "Quality");
		self.filterDiff($("#diff_slider").data("ionRangeSlider").result.from,$("#diff_slider").data("ionRangeSlider").result.to);
		self.search(searchString);
	};
	this.initMap();
	this.getHikes();

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
			self.runAllFilters();
		}
	});

	$("#star_slider").ionRangeSlider({
		type: "double",
		min: 1,
		max: 5,
		from: 1,
		to: 5,
		postfix: " &#9733;",
		hide_min_max: true,
		onFinish: function (data){
			self.runAllFilters();
		}
	});

	$("#diff_slider").ionRangeSlider({
		type: "double",
		from: 0,
		to: 5,
		hide_min_max: true,
		values: self.difficultyArr,
		onFinish: function (data){
			self.runAllFilters();
		}
	});
	
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}