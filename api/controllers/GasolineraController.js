/**
 * GasolineraController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var count = 1;
var notFound = 0;
module.exports = {
	index : function(req,res){
		var params = {};
		var mun = {};
		if(req.param('municipio')){
			Municipio.findOne(req.param('municipio')).populate('gasolineras').exec(function(e,municipio){
				res.json(municipio);
			});
		}else if(req.param('entidad')){
			Entidad.findOne(req.param('entidad')).populate('gasolineras').exec(function(e,entidad){
				res.json(entidad);
			});
		}else{
			Gasolinera.find().limit('100000').exec(function(e,gases){
				res.json({
					range : {
				      "maxlat": 28.0855924462176,
				      "maxlng": -86.7384548340363,
				      "minlat": 15.754488,
				      "minlng": -115.197351936726
				    },
				    gasolineras : gases,
				});
			});
		}	

	},
	perfil : function(req,res){
		Gasolinera.findOne({id:req.param('id')}).exec(function(e,gas){
			if(e) throw(e);
			res.view({gas:gas});
		});
	},
};

