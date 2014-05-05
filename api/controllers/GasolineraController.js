/**
 * GasolineraController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	perfil : function(req,res){
		Gasolinera.findOne({id:req.param('id')}).populate('ciudad').exec(function(e,gas){
			if(e) throw(e);
			if(gas){
				var title = 'Gasolinapp | Gasolinera defraudadora: '+gas.nombre+' en '+gas.poblacion;
				res.view({gas:gas,title:title});
			}	
		});		
	},
	geocode : function(req,res){
		var gm = require('googlemaps');
		gm.geocode(req.param('id'), function(e,results){
			if(e) throw(e);
			console.log(e,results);
			res.json(results);
		},'false');			
	}
};
