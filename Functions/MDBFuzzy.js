//Librerias requeridas
var MongoClient = require('mongodb').MongoClient;
var Spinner = require('../Utils/Spinner.js');
var Algorithm = require('./Algorithm.js');

//Constructor
var MDBFuzzy = function(url) {
    this.url = url;
};


//Methods
MDBFuzzy.prototype.checkInsert = function(object, database, collection, algorithm, threshold, callback, n){
 
    //Iniciamos el spinner
    var s = new Spinner();
    s.spin.start();
  
    MongoClient.connect(this.url, function(err, db) {
        if (err) {
            s.spin.stop();
            throw new Error("An error has occurred while the conection was being stablished");   
        }
        
        //Obtenemos la base de datos y comprobamos si la colección tiene datos
        var dbo = db.db(database);
        dbo.collection(collection).findOne({}, function(err, result){
            if(err){
                s.spin.stop();
                throw err;
            } 
            
            //Si no hay ningun dato insertamos directamente
            if(result == undefined){
                dbo.collection(collection).insertOne(object, function(err, res){
                    if (err) throw err;
                    s.spin.stop();
                    db.close();
                    //devolvemos 1 porque ha insertado
                    callback(1);
                });      
            } 
            else {
                dbo.collection(collection).find({}).project({_id:0}).toArray(function(err, docs){
                    if(err) throw err;
                    
                    //Creamos el objeto algoritmo con la información pasada por parametro
                    var alg = new Algorithm(algorithm, n);
                    var similar = false;
                    
                    for(i in docs){
                        //comprobamos si la similitud es mayor que el treshold
                        var similarity = alg.getSimilairty(JSON.stringify(object), JSON.stringify(docs[i]));
                        if(similarity >= threshold){
                            similar = true;
                        } 
                    }
                    
                    if(similar){
                        s.spin.stop();
                        db.close();
                        callback(0);
                    } else {
                        dbo.collection(collection).insertOne(object, function(err, res){
                            if (err) throw err;
                            s.spin.stop();
                            db.close();
                            callback(1);
                        }); 
                    }
                });
            }
        }); 
    }); 
}
    
MDBFuzzy.prototype.cleanCollection = function(database, collection, algorithm, threshold, callback, n){
    //Iniciamos el spinner
    var s = new Spinner();
    s.spin.start();
    
    //Conectamos a mongo
    MongoClient.connect(this.url, function(err, db) {
        if (err) {
            s.spin.stop();
            throw new Error("An error has occurred while the conection was being stablished");   
        }
        
        //Obtenemos la base de datos y extraemos los datos de la coleccion
        var dbo = db.db(database);
        dbo.collection(collection).find({}).toArray(function(err, docs){
            if(err) throw err;
   
            //Creamos el objeto algoritmo con la información pasada por parametro
            var alg = new Algorithm(algorithm, n);
            //Copiamos el array de documentos 
            var arr_copy = [];
            for(var i in docs){
                arr_copy.push(JSON.stringify(docs[i]));
            }
            
            //Recorremos la colección fijando un documento y comparandolo con los demás
            for(var i=0; i<docs.length; i++){
                for(j=i+1; j<docs.length; j++){
                    //Si no se trata del mismo elemento, y el array auxiliar contiene el elemento (No se ha borrado antes)
                    if(i != j  && arr_copy.includes(JSON.stringify(docs[j]))){
                        //Creamos dos variables para comparar la similitud
                        var compare_i = JSON.parse(JSON.stringify(docs[i]));
                        var compare_j = JSON.parse(JSON.stringify(docs[j]));
                        //Eliminamos la propiedad _id para que no interfiera en el contenido
                        delete compare_i['_id'];
                        delete compare_j['_id'];
                        //Calculamos la similitud entre las dos variables
                        var similarity = alg.getSimilairty(JSON.stringify(compare_i), JSON.stringify(compare_j));
                        
                        //Si supera el umbral lo borramos
                        if(similarity >= threshold){
                            delete arr_copy[j];
                            dbo.collection(collection).deleteOne(docs[j]);
                        }   
                    }  
                }
            }
            
            s.spin.stop();
            db.close();
            callback(0);
        });
    });
}

module.exports = MDBFuzzy;
