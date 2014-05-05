/*
ogr2ogr -f GeoJSON -t_srs crs:84 ESPV10132DIC13A.geojson ESPV10132DIC13A.shp
*/
module.exports = {
	extractCiudades : function(){
		require('async');
		Gasolinera.find({}).exec(function(e,Gasolineras){
			async.mapSeries(Gasolineras,extractCiudad,function(err,res){
				if(err){console.log(err); throw err};				
				console.log('Gases Procesadas: %d',res.length);
			});
		});
	},
	
	geocodeCiudades : function(){
		var gm = require('googlemaps');
		Ciudad.find({}).exec(function(e,ciudades){
			ciudades.foreach(function(ciudad){
				geocodeString(ciudad.nombre);
			});
			
		});		
	},	
};
var geocodeString = function(string){
	gm.geocode(req.param('id'), function(e,results){
		if(e) throw(e);
		console.log(e,results);
		res.json(results);
	},'false');			
}

var extractCiudad = function(gas,callback){
	Ciudad.findOrCreate({nombre:gas.poblacion},{nombre:gas.poblacion},function(e,ciudad){
		if(e) return callback(e,ciudad);
		gas.ciudad = ciudad.id;
		gas.save(callback);
	});
}