/**
* Municipio.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		entidad:{
			model : 'entidad',
			index : true,
		},
		nombre : 'string',
		range : 'json',
		gasolineras : {
			collection: "gasolinera",
      		via: "municipio"
		}
	},
	//migrate : 'safe',
};

