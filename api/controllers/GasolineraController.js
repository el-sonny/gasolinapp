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
		if(req.param('coords')){
			get_by_coords(req.param('coords'),function(e,municipio){
				if(municipio){
					Municipio.findOne(municipio).populate('gasolineras').populate('entidad').exec(function(e,municipio){
						return res.json(municipio);
					});
				}else{
					find_normal(req,res);
				}
			});			
		}else{
			find_normal(req,res);
		}

	},
	perfil : function(req,res){
		Gasolinera.findOne({id:req.param('id')}).exec(function(e,gas){
			if(e) throw(e);
			res.view({gas:gas});
		});
	},
};

function get_by_coords(coords,cb){
	Municipio.find({}).exec(function(e,municipios){
		municipios.forEach(function(municipio){
			if(
				municipio.range.maxlat > coords.lat &&
				coords.lat > municipio.range.minlat &&
				municipio.range.maxlng > coords.long &&
				coords.long > municipio.range.minlng
			){
				if(municipio.nombre){
					cb(null,municipio.id);
				}
			}
		});
		//cb(null,false);
	})
}
function find_normal(req,res){
	if(req.param('municipio')){
		Municipio.findOne(req.param('municipio')).populate('gasolineras').populate('entidad').exec(function(e,municipio){
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
}
