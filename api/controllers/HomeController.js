/**
 * HomeController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	index : function(req,res){
		var data = getData(req,function(data){
			data.isScrollable = true;
			res.view(data);	
		});		
	},	
	widget : function(req,res){
		var data = getData(req,function(data){
			data.isScrollable = false;
			res.view(data);	
		});		
	}
};
function getData(req,cb){
	var geoip = require('geoip-lite');
	Entidad.find({}).sort('nombre').exec(function(e,entidades){
		Municipio.find({}).populate('entidad').sort('nombre').exec(function(e,municipios){
			if(e) throw(e);
			var ip = req.ip;

			ip = ip == '127.0.0.1' ? "189.221.131.25" : '';
			var geo = geoip.lookup(ip);
			var selectedMunicipio = false;
			var selectedEntidad = entidades[8];
			//console.log(geo);
			if(geo && geo.ll){
				
				municipios.forEach(function(municipio){
					if(
						municipio.range.maxlat > geo.ll[0] &&
						geo.ll[0] > municipio.range.minlat &&
						municipio.range.maxlng > geo.ll[1] &&
						geo.ll[1] > municipio.range.minlng
					){
						if(municipio.nombre){
							selectedMunicipio = municipio;
							selectedEntidad = municipio.entidad;
						}
					}
				});
			}
			var data = {
				municipios:municipios,
				entidades:entidades,
				selectedEntidad:selectedEntidad,
				selectedMunicipio:selectedMunicipio,
			};
			cb(data);
		});
	});
}
