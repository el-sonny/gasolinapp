var app = angular.module("gasolinapp", ['ngSails','ui.select2','leaflet-directive']);


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