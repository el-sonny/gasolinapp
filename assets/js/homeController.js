app.controller("homeController", function ($scope, $sails , $location) {
	$scope.mapCenter = {};
    $scope.bounds = {}
	$scope.markers = [];
    $scope.gasolineras = [];
	$scope.municipios = municipios;
	$scope.entidades = entidades;
	$scope.selectedEntidad = selectedEntidad;
    $scope.selectedMunicipio = null;
    $scope.gasStats = {'VERDE':0,'AMARILLO':0,'ROJO':0,'GRAY':0};
    if(selectedMunicipio){
        municipios.forEach(function(m){
            if(m.id == selectedMunicipio)
            $scope.selectedMunicipio = m;            
        });
    }
    $scope.toggleJumbotron = false;
    $scope.toggleGasBox = true;

    //Hash from url
    //Escuchando a a selectedEntidad y asignando su valor al path de la url
    $scope.$watch('selectedEntidad', function(path) {
      $location.path(path);
    });
    //Escuchando todo y regresando el path en la url
    //Asignandole a selectedEntidad el path en la url
    $scope.$watch(function() {
      $scope.locationCustom = $location.path().split("/")[1];
      return $location.path();
    }, function(path) {
      $scope.selectedEntidad = path.split("/")[1];
      $scope.get_gasolineras(true);
    });

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

    $scope.gasSummary = function(){
        var location = $scope.selectedMunicipio ? $scope.selectedMunicipio.nombre+', '+$scope.selectedEntidad : $scope.selectedEntidad;
        var text = $scope.gasolineras.length+' gasolineras en '+location;
        return text;
    }
	$scope.get_gasolineras = function(chstate){
        if(chstate) $scope.selectedMunicipio = null;
        $scope.mapClass = 'blur';
        var params  = {estado:$scope.selectedEntidad,limit:100000};
        if($scope.selectedMunicipio && $scope.selectedMunicipio != ""){
            params.municipio = $scope.selectedMunicipio.id;
        }
        $scope.gasStats = {'VERDE':0,'AMARILLO':0,'ROJO':0,'GRAY':0};
		$sails.get("/gasolinera",params)
		.success(function (data) {
            console.log(data,params);
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
                    $scope.gasStats[color]++;
				});
				$scope.markers = markers;
                var bounds_base = $scope.selectedMunicipio ? data[0].municipio : entidad;
				$scope.bounds = {
					northEast : {
                        lat : bounds_base.range.maxlat,
                        lng : bounds_base.range.maxlng,
                    },
                    southWest : {
                        lat : bounds_base.range.minlat,
                        lng : bounds_base.range.minlng,
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
    $scope.munFilter = function(){
        return function(m){
            return (!$scope.selectedEntidad || $scope.selectedEntidad == m.entidad.nombre) && m.nombre && m.entidad.nombre;
        }
    }

});
function makeClusterIcon(cluster,color){
	return new L.DivIcon({ 
    	html:'<div><span>'+cluster.getChildCount()+'</span></div>',
    	className:'leaflet-marker-icon marker-cluster marker-cluster-small leaflet-zoom-animated leaflet-clickable '+color,
    	iconSize: L.point(40, 40)
    });
}


