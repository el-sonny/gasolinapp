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

	importAllGases : function(){
		require('async');
		var geojson = require('./gasolineras.json');
		var gasolineras = [];
		geojson.features.forEach(function(feature){
			gasolineras.push({
				num : feature.properties.ID,
				descripcion : feature.properties.DESCRIPCIO,
				estado : feature.properties.ESTADO,
				municipio : feature.properties.MUNICIPIO,
				localidad : feature.properties.LOCALIDAD,
				colonia : feature.properties.COLONIA,
				cp : feature.properties.CP,
				calle : feature.properties.CALLE,
				coordenadas : feature.geometry.coordinates,
			});
		});		
		async.mapSeries(gasolineras,function(gas,cb){Gasolinera.findOrCreate(gas,gas,cb)},function(e,gases){
			if(e) throw(e);
			return 'Saved'+gases.length;	
		});
	},
	ciudades : function(req,res){
		Gasolinera.find({}).limit(200000).exec(function(e,gases){
			async.mapSeries(gases,mapGeo,function(e,gases){
				if(e) throw(e);
				res.json(gases);
			});
		});
	},
	mapFraud : function (req,res){
		// node samples/sample.js
		Levenshtein = require('levenshtein');
		var csv = require('csv');
		var fs = require('fs');
		csv()
		.from.stream(fs.createReadStream('assets/files/Semaforo_Datos_Abiertos.csv'))
		.on('record', function(row,index){
				//console.log('#'+index+' '+row);
				if(index) mapProfeco(row);
		})
		.on('end', function(count){
		  console.log('Number of lines: '+count);
		})
		.on('error', function(error){
		  console.log(error.message);
		});
	},
	geocodeEntidades : function(){
		Gasolinera.find({}).exec(function(e,gases){
			if(e) throw(e);
			var entidades = [];
			gases.forEach(function(gas){
				if(entidades[gas.entidad]){
					entidades[gas.entidad] = {
						maxlat : entidades[gas.entidad].maxlat < gas.coordenadas[1] ? gas.coordenadas[1] : entidades[gas.entidad].maxlat,
						maxlng : entidades[gas.entidad].maxlng < gas.coordenadas[0] ? gas.coordenadas[0] : entidades[gas.entidad].maxlng,
						minlat : entidades[gas.entidad].minlat > gas.coordenadas[1] ? gas.coordenadas[1] : entidades[gas.entidad].minlat,
						minlng : entidades[gas.entidad].minlng > gas.coordenadas[0] ? gas.coordenadas[0] : entidades[gas.entidad].minlng,
					}					
				}else{
					entidades[gas.entidad] = {
						maxlat : gas.coordenadas[1],
						maxlng : gas.coordenadas[0],
						minlat : gas.coordenadas[1],
						minlng : gas.coordenadas[0],	
					}					
				}
			});
			Entidad.find({}).exec(function(e,ents){
				ents.forEach(function(entidad){
					entidad.range = entidades[entidad.id];
					entidad.save();
				})
			});
		})
	}

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
function mapProfeco(row,cb){
	var pad = row[0].length < 5 ? '00000'.substr(0,5-row[0].length) : '';
	var num = 'E'+pad+row[0];
	Gasolinera.findOne({num:num}).exec(function(e,gas){
		if(e) throw(e);
		if(!gas){
			console.log(num,' not found '+notFound++,row[7]);
		}else{
			if(!gas.calle)	gas.calle = row[2];
			gas.razon_social = row[1];
			gas.expediente_profeco = row[5];
			gas.fecha_de_verificacion = row[6];
			gas.semaforo = row[7];
			gas.save(cb);
			console.log('linkeado con expediente profeco: '+count++);
		}
	});
}
function mapGeo(gas,cb){
	console.log('procesando: ',count++);
	Entidad.findOrCreate({nombre:gas.estado},{nombre:gas.estado},function(e,ent){
		if(e) return cb(e,ent);
		var mun = {nombre:gas.municipio,entidad:ent.id};
		Municipio.findOrCreate(mun,mun,function(e,mun){
			if(e) return cb(e,mun);
			gas.entidad = ent.id;
			gas.municipio_id = mun.id;
			gas.save(cb);
		});
	});
}