/**
 * HomeController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	index : function(req,res){
		Entidad.find({}).sort('nombre').exec(function(e,entidades){
			Municipio.find({}).sort('nombre').exec(function(e,municipios){
				res.view({municipios:municipios,entidades:entidades});
			});
		});
	},	
};
