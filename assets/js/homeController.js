app.controller("homeController", function ($scope, $http, $location, geolocation) {
    
	$scope.mapCenter = {};
    $scope.bounds = {}
	$scope.markers = [];
    $scope.gasolineras = [];
	$scope.municipios = municipios;
	$scope.entidades = entidades;
    //$scope.selectedEntidad = selectedEntidad;
    $scope.selectedMunicipio = selectedMunicipio;
    $scope.gasStats = {'VERDE':0,'AMARILLO':0,'ROJO':0,'GRAY':0};
    $scope.toggleJumbotron = false;
    $scope.toggleGasBox = true;
    $scope.toggleSidebar = true;
    var firstload = true;
    
    $scope.selectedMunicipio = find_municipio(selectedMunicipio);

    //Hash from url
    //Escuchando a a selectedEntidad y asignando su valor al path de la url
    $scope.$watch('selectedEntidad', function(path) {
        if(path) $location.path(path.nombre);
    });
    //Escuchando todo y regresando el path en la url
    //Asignandole a selectedEntidad el path en la url
    $scope.$watch(function() {
      return $location.path();
    }, function(path) {
      if(path || null){
        var estado = path.split("/")[1];
        $scope.selectedEntidad = find_entidad(estado);
        if(firstload) $scope.selectedMunicipio = null;        
        $scope.get_gasolineras();
        firstload = false;
      }else{
        firstload = false;
        if(selectedEntidad){
            $scope.selectedEntidad = find_entidad(selectedEntidad.nombre);
        }
      }
    });

	$scope.layers =  {
        baselayers: {
            xyz: {
                name: 'OpenStreetMap (XYZ)',
                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                type: 'xyz',
                layerOptions: {
                    attribution: '<a href="http://spaceshiplabs.com" target="_blank">Spaceshiplabs.com</a> | <a  target="_blank" href="http://gasolinapp.com">Gasolinapp.com</a>'
                }
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
        attributionControl : true, 
        zoomControlPosition: 'bottomright',
    }
    $scope.options.scrollWheelZoom = isScrollable;
    $scope.mapClass = '';

    $scope.change_filter = function(clearmun){
        if(clearmun) $scope.selectedMunicipio = null;
        $scope.coords = null;
        $scope.get_gasolineras();
    }

    $scope.getGeoLocalization = function(){
        geolocation.getLocation().then(function(data){
          $scope.coords = {lat:data.coords.latitude, long:data.coords.longitude};
          $scope.get_gasolineras()
        });
    }

    $scope.gasSummary = function(){
        var location = $scope.selectedMunicipio ? $scope.selectedMunicipio.nombre.capitalize()+', '+$scope.selectedEntidad.nombre : 
        $scope.selectedEntidad ? $scope.selectedEntidad.nombre : "México";
        var text = $scope.gasolineras.length+' gasolineras en '+location;
        return text;
    }
	$scope.get_gasolineras = function(){
        $scope.mapClass = 'blur';
        var params = {};
        if($scope.selectedEntidad && $scope.selectedEntidad != ""){
            params.entidad = $scope.selectedEntidad.id;
        }
        if($scope.selectedMunicipio && $scope.selectedMunicipio != ""){
            params.municipio = $scope.selectedMunicipio.id;
        }
        if($scope.coords){
            params.coords = $scope.coords;
        }
		//$sails.get("/gasolinera",params)
        $http({method: 'GET', url: '/gasolinera',params:params})
		.success(function (data){
            if(data.entidad){
                $scope.selectedEntidad = find_entidad(data.entidad.nombre);
                $scope.selectedMunicipio = find_municipio(data);
            }
            $scope.gasStats = {'VERDE':0,'AMARILLO':0,'ROJO':0,'GRAY':0};
            var munlytics = $scope.selectedMunicipio && $scope.selectedMunicipio.nombre ? $scope.selectedMunicipio.nombre : 'entidad completa';
            var entidadlics = $scope.selectedEntidad && $scope.selectedEntidad.nombre ? $scope.selectedEntidad.nombre : 'Todo Mexico';
            ga('send', 'event', 'button', entidadlics,munlytics);
			$scope.gasolineras = data.gasolineras;
            var bounds_base = data.range;
			if(data.gasolineras.length){
				var markers = [];
				data.gasolineras.forEach(function(gas){
					var razon = gas.razon_social ? gas.razon_social : 'No disponible';
					var color = gas.semaforo ? gas.semaforo : 'GRAY';
					var semaforo = gas.semaforo ? gas.semaforo : 'No disponible';
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
               
				$scope.bounds = {
					northEast : {
                        lat : bounds_base.maxlat,
                        lng : bounds_base.maxlng,
                    },
                    southWest : {
                        lat : bounds_base.minlat,
                        lng : bounds_base.minlng,
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

    $scope.munFilter = function(){
        return function(m){
            return (!$scope.selectedEntidad || $scope.selectedEntidad.id == m.entidad.id) && m.nombre && m.entidad.nombre;
        }
    }


    //Hide y show de sidebar (pseudo media-queries)
    var screenSize = $(window).width();
    if(screenSize < 767){
        $scope.toggleSidebar = false;
        $scope.toggleGasBox = false;            
    }
    $( window ).resize(function() {
        screenSize = $(window).width();
        if(screenSize < 767){
            $scope.toggleSidebar = false;
            $scope.toggleGasBox = false; 
        }
        else{
            $scope.toggleSidebar = true;
            $scope.toggleGasBox = true;
        }

    });


});
function makeClusterIcon(cluster,color){
	return new L.DivIcon({ 
    	html:'<div><span>'+cluster.getChildCount()+'</span></div>',
    	className:'leaflet-marker-icon marker-cluster marker-cluster-small leaflet-zoom-animated leaflet-clickable '+color,
    	iconSize: L.point(40, 40)
    });
}


String.prototype.capitalize = function() {
    return this.toLowerCase().replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

function find_municipio(municipio){
    if(municipio){
        for(x in municipios){
            if(municipios[x].id == municipio.id){
                return municipios[x];
            }
        }
        return false;
    }
}
function find_entidad(nombre){
    for(x in entidades){
        if(entidades[x].nombre == nombre) return entidades[x];
    }
    return false;
}