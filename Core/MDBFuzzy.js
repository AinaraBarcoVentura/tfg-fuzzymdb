//Librerias requeridas
var MongoClient = require('mongodb').MongoClient;
var Spinner = require('../Utils/Spinner.js');
var Algorithm = require('./Algorithm.js');
var JSONCompare = require('../Utils/compareJSONValues.js');

//Constructor
var MDBFuzzy = function(url) {
    this.url = url;
};


//Methods
MDBFuzzy.prototype.insertOneFuzzy = function(object, database, collection, threshold, accurate, callback, n, k, algorithm){
 
    //Iniciamos el spinner
    var s = new Spinner();
    s.spin.start();
    
    //Creamos el objeto que calcula el algoritmo si accurate es falso
    var alg = undefined;
    if(!accurate){
        alg = new Algorithm(algorithm, n);
    } 
    //Si no, creamos un objeto compareJSON que utiliza varios algoritmos para obtener la similitud
    else{
        alg = new JSONCompare(threshold, n, k);
    }
  
    MongoClient.connect(this.url, function(err, db) {
        if (err) {
            s.spin.stop();
            callback(err, undefined); 
        }
        
        //Obtenemos la base de datos y comprobamos si la colección tiene datos
        var dbo = db.db(database);
        dbo.collection(collection).findOne({}, function(err, result){
            if(err){
                s.spin.stop();
                db.close();
                callback(err, undefined);
            } 
            
            //Si no hay ningun dato insertamos directamente
            if(result == undefined){
                dbo.collection(collection).insertOne(object, function(err, res){
                    if (err) {
                        s.spin.stop();
                        db.close();
                        callback(err, undefined);
                    }
                    
                    s.spin.stop();
                    db.close();
                    //devolvemos 1 porque ha insertado
                    callback(err, 1);
                });      
            } 
            else {
                dbo.collection(collection).find({}).project({_id:0}).toArray(function(err, docs){
                    if(err) {
                        s.spin.stop();
                        db.close();
                        callback(err, undefined);
                    }
                    
                    var similar = false;
                    
                    for(i in docs){
                        //comprobamos si la similitud es mayor que el treshold
                        var similarity = alg.getSimilarity(object, docs[i]);
                        if(similarity >= threshold){
                            similar = true;
                        } 
                    }
                    
                    if(similar){
                        s.spin.stop();
                        db.close();
                        callback(err, 0);
                    } else {
                        dbo.collection(collection).insertOne(object, function(err, res){
                            if (err) {
                                s.spin.stop();
                                db.close();
                                callback(err, undefined);
                            }
                            s.spin.stop();
                            db.close();
                            callback(err, 1);
                        }); 
                    }
                });
            }
        }); 
    }); 
}

MDBFuzzy.prototype.insertManyFuzzy = function(arrayObjects, database, collection,  threshold, accurate, callback, n, k, algorithm){
    
    //Iniciamos el spinner
    var s = new Spinner();
    s.spin.start();
    
    
    //Creamos el objeto que calcula el algoritmo si accurate es falso
    var alg = undefined;
    if(!accurate){
        alg = new Algorithm(algorithm, n);
    } 
    //Si no, creamos un objeto compareJSON que utiliza varios algoritmos para obtener la similitud
    else{
        alg = new JSONCompare(threshold, n, k);
    }
    
    
    
    MongoClient.connect(this.url, function(err, db) {
        if (err) {
            s.spin.stop();
            callback(err, undefined); 
        }
        
        //Obtenemos la base de datos y comprobamos si la colección tiene datos
        var dbo = db.db(database);
        dbo.collection(collection).findOne({}, function(err, result){
            if(err){
                s.spin.stop();
                db.close();
                callback(err, undefined);
            } 
            
            //Si no hay ningun dato insertamos directamente
            if(result == undefined){
                dbo.collection(collection).insertMany(arrayObjects, function(err, res){
                    if (err) {
                        s.spin.stop();
                        db.close();
                        callback(err, undefined);
                    }
                    s.spin.stop();
                    db.close();
                    //devolvemos 1 porque ha insertado
                    callback(err, arrayObjects.length);
                });    
            } 
            else {
                dbo.collection(collection).find({}).project({_id:0}).toArray(function(err, docs){
                    if (err) {
                        s.spin.stop();
                        db.close();
                        callback(err, undefined);
                    }
                    //Creamos el contador de objetos insertados
                    var cont = 0;
                    //Creamos el objeto algoritmo con la información pasada por parametro
                    
                    var similar = false;
                    for(var i = 0; i<arrayObjects.length; i++){
                        for(var j in docs){
                            var similarity = alg.getSimilarity(arrayObjects[i], docs[j]);
                            if(similarity >= treshold){
                                similar = true;
                            }
                        }
                        if(!similar){
                            cont++;
                            dbo.collection(collection).insertOne(arrayObjects[i]);
                        }
                        similar = false;
                    }
                    s.spin.stop();
                    db.close();
                    callback(err, cont);
                });
            }
        });
    });
}
    
MDBFuzzy.prototype.cleanCollection = function(database, collection,  threshold, accurate, callback, n, k, algorithm){
    //Iniciamos el spinner
    var s = new Spinner();
    s.spin.start();
    
    //Creamos el objeto que calcula el algoritmo si accurate es falso
    var alg = undefined;
    if(!accurate){
        alg = new Algorithm(algorithm, n);
    } 
    //Si no, creamos un objeto compareJSON que utiliza varios algoritmos para obtener la similitud
    else{
        alg = new JSONCompare(threshold, n, k);
    }
    
    //Conectamos a mongo
    MongoClient.connect(this.url, function(err, db) {
        if (err) {
            s.spin.stop();
            callback(err, undefined); 
        }
        
        //Obtenemos la base de datos y extraemos los datos de la coleccion
        var dbo = db.db(database);
        dbo.collection(collection).find({}).toArray(function(err, docs){
            if(err) {
                s.spin.stop();
                db.close();
                callback(err, undefined);  
            }
   
        
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
                        var similarity = alg.getSimilarity(compare_i, compare_j);
                        
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
            callback(err, cont);
        });
    });
}

MDBFuzzy.prototype.findSimilarDocuments = function(object, database, collection,  threshold, accurate, callback, n, k, algorithm){
    
    //Iniciamos el spinner
    var s = new Spinner();
    s.spin.start();
    
    
    //Creamos el objeto que calcula el algoritmo si accurate es falso
    var alg = undefined;
    if(!accurate){
        alg = new Algorithm(algorithm, n);
    } 
    //Si no, creamos un objeto compareJSON que utiliza varios algoritmos para obtener la similitud
    else{
        alg = new JSONCompare(threshold, n, k);
    }
    
    
    //Declaramos el array de retorno
    var returned_arr = [];
    
    MongoClient.connect(this.url, function(err, db) {
        if (err) {
            s.spin.stop();
            callback(err, undefined); 
        }
        
        //Obtenemos la base de datos y comprobamos si la colección tiene datos
        var dbo = db.db(database);
        dbo.collection(collection).findOne({}, function(err, result){
            if(err){
                s.spin.stop();
                db.close();
                callback(err, undefined);
            } 
            
            //Si no hay ningun dato devolvemos el array de documentos similares vacio
            if(result == undefined){
                s.spin.stop();
                db.close();
                //devolvemos 1 porque ha insertado
                callback(err, returned_arr);     
            } 
            else {
                dbo.collection(collection).find({}).project({_id:0}).toArray(function(err, docs){
                    if(err) {
                        s.spin.stop();
                        db.close();
                        callback(err, undefined);
                    }
                    
                    for(var i in docs){
                        //comprobamos si la similitud es mayor que el treshold
                        var similarity = alg.getSimilarity(object, docs[i]);
                        if(similarity >= threshold){
                            returned_arr.push(docs[i]);
                        }
                    }
                    s.spin.stop();
                    db.close();
                    callback(err, returned_arr);
                });   
            }
        });
    });
}

module.exports = MDBFuzzy;
