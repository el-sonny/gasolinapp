var app = angular.module("gasolinapp", ['ngSails','ui.select2','google-maps']);

//OPTIONAL! Set socket URL!
app.config(['$sailsProvider', function ($sailsProvider) {
    $sailsProvider.url = 'http://localhost:1337';
}]);

app.controller("gasolinerasCTL", function ($scope, $sails) {
	$scope.ciudades = [];
	$scope.selectedCity = 'CANCUN QROO';

	$sails.get("/ciudad",{limit:1000})
	  .success(function (data) {
	    $scope.ciudades = data;
	    //console.log($scope.ciudades);
	  })
	  .error(function (data) {
	    alert('Houston, we got a problem!');
	  });

	$sails.get("/gasolinera",{poblacion:$scope.selectedCity})
	  .success(function (data) {
	    $scope.gasolineras = data;
	    console.log($scope.gasolineras);
	  })
	  .error(function (data) {
	    alert('Houston, we got a problem!');
	  });

	$sails.on("message", function (message) {
	  if (message.verb === "create") {
	    $scope.ciudades.push(message.data);
	  }
	});
	$scope.selectCity = function(){
		console.log($scope.selectedCity)
	}

	$scope.geoGlyph = function(gas){
		return gas.coords ? 'glyphicon-ok' : 'glyphicon-remove'
	}
});

app.controller("gasolineraCTL", function ($scope, $sails) {
	$scope.map = {
		center: {
			latitude: 45,
			longitude: -73
		},
		zoom: 15
	};
	gas.searchString = gas.nombre+', '+gas.poblacion;

	//$scope.geolocate();
	
	$scope.gas = gas;
	
	$scope.geolocate = function(){
		$.get('/gasolinera/geocode',{id:gas.searchString},function(data){
			console.log(data);
			if(data.results.length && data.results[0].geometry.location){
				$scope.map.center.latitude = data.results[0].geometry.location.lat;
				$scope.map.center.longitude = data.results[0].geometry.location.lng;
				$scope.$apply();
			}
		},'json');	
	}
});