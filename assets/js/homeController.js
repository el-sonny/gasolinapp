app.controller("homeController", function ($scope, $sails) {
	$scope.mapCenter = {};
    $scope.bounds = {}
	$scope.markers = [];
	$scope.municipios = municipios;
	$scope.entidades = entidades;
	$scope.selectedEntidad = geo;
    console.log(geo);

	$scope.layers =  {
        baselayers: {
            xyz: {
                name: 'OpenStreetMap (XYZ)',
                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                type: 'xyz'
            }
        },
        overlays: {
            VERDE: {
                name: 'Gasolineras con Semaforo Verde',
                type: 'markercluster',
                visible: true,
                layerOptions : {
		            iconCreateFunction: function(cluster) {
				        return makeClusterIcon(cluster,'VERDE')
				    }
                }
            },
            AMARILLO: {
                name: 'Gasolineras con semaforo amrillo',
                type: 'markercluster',
                visible: true,
                layerOptions : {
		            iconCreateFunction: function(cluster) {
				        return makeClusterIcon(cluster,'AMARILLO')
				    }
                }
            },
            ROJO: {
                name: 'Gasolineras con semaforo rojo',
                type: 'markercluster',
                visible: true,
                layerOptions : {
		            iconCreateFunction: function(cluster) {
				        return makeClusterIcon(cluster,'ROJO')
				    }
                }
            },
            GRAY: {
                name: 'Gasolineras no evaluadas por PROFECO',
                type: 'markercluster',
                visible: true,
                layerOptions : {
		            iconCreateFunction: function(cluster) {
				        return makeClusterIcon(cluster,'GRAY')
				    }
                }
            },

        }
    }
    $scope.icons =  {
    	VERDE: {
            type: 'awesomeMarker',
            icon: 'filter',
            markerColor: 'green'
        },
    	AMARILLO: {
            type: 'awesomeMarker',
            icon: 'filter',
            markerColor: 'orange'
        },
    	ROJO: {
            type: 'awesomeMarker',
            icon: 'filter',
            markerColor: 'red'
        },
    	GRAY: {
            type: 'awesomeMarker',
            icon: 'filter',
            markerColor: 'gray',
        },
    }  
	$scope.options = {
        attributionControl : false, 
        zoomControlPosition: 'bottomleft',
    }
    $scope.mapClass = '';
	$scope.get_gasolineras = function(){
        $scope.mapClass = 'blur';
		$sails.get("/gasolinera",{estado:$scope.selectedEntidad,limit:10000})
		.success(function (data) {

			$scope.gasolineras = data;
			if(data.length){
				var markers = [];
                var entidad = data[0].entidad;
				data.forEach(function(gas){
					var razon = gas.razon_social ? gas.razon_social : 'No disponible';
					var color = gas.semaforo ? gas.semaforo : 'GRAY';
					var semaforo = gas.semaforo ? gas.semaforo : 'No evaluado';
					var message = '<b>Estacion:</b> '+gas.num+'<br/> ';
					message += '<b>Direccion:</b> '+gas.calle+'<br/>';
					message += '<b>Razon Social:</b> '+razon+'<br/>';
					message += '<b>Semaforo Profeco:</b> '+semaforo+'';
					markers.push({
						lat: gas.coordenadas[1],
						lng: gas.coordenadas[0],
						message: message,
						layer : color,
						icon : $scope.icons[color],

					});
				});
				$scope.markers = markers;
				$scope.bounds = {
					northEast : {
                        lat : entidad.range.maxlat,
                        lng : entidad.range.maxlng,
                    },
                    southWest : {
                        lat : entidad.range.minlat,
                        lng : entidad.range.minlng,
                    },
				}/*
                $scope.mapCenter = {
                    lng : markers[0].lng,
                    lat : markers[0].lat,
                    zoom : 7,
                }*/
			}

            $scope.mapClass = '';
		});
	};

	$scope.get_gasolineras();

});
function makeClusterIcon(cluster,color){
	return new L.DivIcon({ 
    	html:'<div><span>'+cluster.getChildCount()+'</span></div>',
    	className:'leaflet-marker-icon marker-cluster marker-cluster-small leaflet-zoom-animated leaflet-clickable '+color,
    	iconSize: L.point(40, 40)
    });
}