/**
 * GasolineraController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var count = 1;
var notFound = 0;
module.exports = {
	perfil : function(req,res){
		Gasolinera.findOne({id:req.param('id')}).exec(function(e,gas){
			if(e) throw(e);
			res.view({gas:gas});
		});
	},
};

