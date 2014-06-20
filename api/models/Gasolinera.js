/**
* Gasolinera.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	entidad:{
  		model : 'entidad',
  	},
  	municipio:{
  		model : 'municipio',
      index : true,
  	},
  	estado:{
  		type: 'string',
  		index : true
  	},
    coordenadas : 'json',
    num : 'string',
    descripcion : 'string',
    semaforo : 'string',
    calle : 'string',
    cp : 'string',
    colonia : 'string',
    localidad : 'string',
    razon_social : 'string',
  },
  migrate : 'safe'
};

