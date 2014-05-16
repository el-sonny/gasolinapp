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
			Municipio.find({}).populate('entidad').sort('nombre').exec(function(e,municipios){
				var ip = "189.221.131.25";
				var geo = geoip.lookup(ip);
				var selectedMunicipio = false;
				//console.log(geo);
				if(geo.ll){
					municipios.forEach(function(municipio){
						if(
							municipio.range.maxlat > geo.ll[0] &&
							geo.ll[0] > municipio.range.minlat &&
							municipio.range.maxlng > geo.ll[1] &&
							geo.ll[1] > municipio.range.minlng
						){
							if(municipio.nombre){
								selectedMunicipio = municipio.id;
								selectedEntidad = municipio.entidad.nombre;
							}
						}
					});
					//if(!selectedEntidad) var selectedEntidad = 'Distrito Federal';	
				}
				res.view({
					municipios:municipios,
					entidades:entidades,
					selectedEntidad:selectedEntidad,
					selectedMunicipio:selectedMunicipio,
				});
			});
		});
	},	
};
