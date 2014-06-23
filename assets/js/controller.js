var app = angular.module("gasolinapp", ['ngSails','ngAnimate','leaflet-directive','geolocation']);
app.config(['$locationProvider', function($location) {
  $location.hashPrefix('!');
}]);

/*//OPTIONAL! Set socket URL!
app.config(['$sailsProvider', function ($sailsProvider) {
    $sailsProvider.url = 'http://localhost:1337';
}]);
*/


app.controller("gasolineraCTL", function ($scope, $sails) {
	$scope.gas = gas;
	$scope.mapCenter = {
		lng : gas.coordenadas[0][0],
		lat : gas.coordenadas[0][1],
		zoom : 14,
	}
	$scope.markers = [{
        lat: gas.coordenadas[0][1],
        lng: gas.coordenadas[0][0],
        message: gas.num,
    }];
   
});