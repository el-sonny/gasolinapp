/**
 * HomeController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	index : function(req,res){
		var geoip = require('geoip-lite');
		Entidad.find({}).sort('nombre').exec(function(e,entidades){
			Municipio.find({}).sort('nombre').exec(function(e,municipios){
				var ip = "189.149.52.115";
				var geo = geoip.lookup(ip);
				if(geo.ll){
					console.log(geo.ll);
					entidades.forEach(function(entidad){
						if(
							entidad.range.maxlat > geo.ll[0] &&
							geo.ll[0] > entidad.range.minlat &&
							entidad.range.maxlng > geo.ll[1] &&
							geo.ll[1] > entidad.range.minlng
						){
							console.log(entidad.nombre);
							if(entidad.nombre != 'VICAM' && !selectedEntidad);
								var selectedEntidad = entidad.nombre;
						}

					})
					if(!selectedEntidad) var selectedEntidad = 'Distrito Federal';	
				}
				res.view({municipios:municipios,entidades:entidades,geo:selectedEntidad});
			});
		});
	},	
};
