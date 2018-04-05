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
    this.searchField = ko.observable("");
    this.difficultyArr = ["green", "greenBlue", "blue", "blueBlack", "black"];
    this.searchField.subscribe(function(newValue){return self.search(newValue);});

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
				Difficulty: trail.difficulty,
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
	};
	this.sortNumber = function(prop){
		self.sortText(prop);
		console.log(self.markerList());
        self.markerList.sort(function(a,b){return a()[prop] - b()[prop];});
	};
	this.sortNumberReverse = function(prop){
		self.sortText(prop);
        self.markerList.sort(function(a,b){return a()[prop] - b()[prop];}).reverse();
	};
	this.sortName = function(prop){
		self.sortText(prop);
		console.log(self.markerList());
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
			if(self.markerList()[i]()[prop] <= to && self.markerList()[i]()[prop] >= from){
				self.markerList()[i]().setMap(map);
				self.markerList()[i]().showInList(true);
			} else{
				self.markerList()[i]().setMap(null);
				self.markerList()[i]().showInList(false);
				
			}
		}
	};
	this.filterDiff = function(from, to){
		for (var i=0; i < self.markerList().length; i++){
			var diff = self.markerList()[i]().Difficulty;
			var index = self.difficultyArr.indexOf(diff);
			if( index <= to && index >= from){
				self.markerList()[i]().setMap(map);
				self.markerList()[i]().showInList(true);
			} else{
				self.markerList()[i]().setMap(null);
				self.markerList()[i]().showInList(false);
			}
		}
	};
	this.search = function(searchString){
		for (var i=0; i < self.markerList().length; i++){
			var search = searchString.toLowerCase();
			var name = self.markerList()[i]().Name.toLowerCase();
			if( name.indexOf(search) != -1){
				self.markerList()[i]().setMap(map);
				self.markerList()[i]().showInList(true);
			} else{
				self.markerList()[i]().setMap(null);
				self.markerList()[i]().showInList(false);	
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
			self.filterNumber(data.from, data.to, "Length");
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
			self.filterNumber(data.from, data.to, "Quality");
		}
	});

	$("#diff_slider").ionRangeSlider({
		type: "double",
		from: 0,
		to: 5,
		hide_min_max: true,
		values: self.difficultyArr,
		onFinish: function (data){
			self.filterDiff(data.from, data.to);
		}
	});
	
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}