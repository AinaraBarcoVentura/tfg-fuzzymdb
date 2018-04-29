//Librerias requeridas
var MongoClient = require('mongodb').MongoClient;
var Spinner = require('../Utils/Spinner.js');
var Algorithm = require('./Algorithm.js');

//Constructor
var MDBFuzzy = function(url) {
    this.url = url;
};


//Methods
MDBFuzzy.prototype.insertOneFuzzy = function(object, database, collection, algorithm, threshold, callback, n){
 
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

MDBFuzzy.prototype.insertManyFuzzy = function(arrayObjects, database, collection, algorithm, treshold, callback, n){
    
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
                dbo.collection(collection).insertMany(arrayObjects, function(err, res){
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
                    //Creamos el contador de objetos insertados
                    var cont = 0;
                    
                    //Creamos el objeto algoritmo con la información pasada por parametro
                    var alg = new Algorithm(algorithm, n);
                    var similar = false;
                    for(var i in arrayObjects){
                        for(var j in docs){
                            var similarity = alg.getSimilairty(JSON.stringify(arrayObjects[i], docs[j]));
                            if(similarity >= treshold){
                                similar = true;
                            }
                        }
                        if(!similar){
                            cont++;
                            db.collection(collection).insertOne(arrayObjects[i]);
                        }
                    }
                    s.spin.stop();
                    db.close();
                    callback(cont);
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
            //Declaramos un contador para el numero de documentos borrados
            var cont = 0;
            
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
                        
                        //Si supera el umbral lo borramos de la bbdd y del array auxiliar, e incrementamos la variable contadora
                        if(similarity >= threshold){
                            cont++;
                            delete arr_copy[j];
                            dbo.collection(collection).deleteOne(docs[j]);
                        }   
                    }  
                }
            }
            
            s.spin.stop();
            db.close();
            callback(cont);
        });
    });
}

MDBFuzzy.prototype.findFuzzy = function(query, database, collection, algorithm, threshold, callback, n){
    
}

module.exports = MDBFuzzy;
