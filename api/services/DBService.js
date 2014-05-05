module.exports = {
	extractCiudades : function(){
		require('async');
		Gasolinera.find({}).exec(function(e,Gasolineras){
			async.mapSeries(Gasolineras,extractCiudad,function(err,res){
				if(err){console.log(err); throw err};				
				console.log('Gases Procesadas: %d',res.length);
			});
		});
	},
	
	
};
var extractCiudad = function(gas,callback){
	Ciudad.findOrCreate({nombre:gas.poblacion},{nombre:gas.poblacion},function(e,ciudad){
		if(e) return callback(e,ciudad);
		gas.ciudad = ciudad.id;
		gas.save(callback);
	});
}