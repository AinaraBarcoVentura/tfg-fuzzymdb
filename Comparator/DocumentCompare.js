
var Ngram = require('../Algorithms/Kondrak.js');
var Levensthein = require('../Algorithms/Levenshtein.js');
var Gauss = require('../Algorithms/Gauss.js');


var CompareDocument = function(threshold, n,  k){
    this.threshold = threshold;
    this.n = n;
    this.k = k;
}

CompareDocument.prototype.getArrSimilarity = function(Object, objectComparison, threshold, n, k){
    var arrValues = [];
    
    
    //Por cada propiedad que el objeto que se compara tenga adicional al original se pushea un 0
    for(var i in objectComparison){
        if(Object[i] == undefined || typeof(Object[i])!=typeof(objectComparison[i])){
            arrValues.push(0);
        }
    }
    
    //Recorremos los campos
    for(var i in Object){
        var val = objectComparison[i];
        var val_orig = Object[i];
        //Si no se encuentra la propiedad en el objeto con el que se compara o son de distinto tipo, se añade el valor de 0
        if(val == undefined || typeof(val_orig) != typeof(val)){
            arrValues.push(0);
        } 
        else {
            //comprobamos si NO es un docuemento anidado
            if(val!="[object BSON]" && val!="[object Object]" || Array.isArray(val)){
                var sim = 0;
                
                //Si son arrays la similitud vendrá dada por el indice de Jaccard Difuso
                if(Array.isArray(val_orig) && Array.isArray(val)){
                    //console.log("Algorithm: fuzzyjaccard ");
                    sim = this.getSimilarityForArrays(val_orig, val, threshold, n, k);
                }
                //Si se trata de un string de tamaño corto vendrá dada por la distancia levensthein
                else if(typeof(val_orig) == "string" && typeof(val) == "string" && (!val_orig.includes(" ") || !val.includes(" "))){
                    var levensthein = new Levensthein();
                    //console.log("Algorithm: levensthein ");
                    sim = levensthein.getSimilarity(val_orig, val);
                    //console.log(sim);
                }
                //si se trata de un string de tamaño más largo entonces se usa el kondrak-ngram
                else if(typeof(val_orig) == "string" && typeof(val) == "string" && (val_orig.includes(" ") || val.includes(" "))){
                    //console.log("Algorithm: kgram ");
                    var kgram = new Ngram(n);
                    sim = kgram.getSimilarity(val_orig, val);
                } 
                //Si se trata de un número se realiza la campana de gauss
                else if(typeof(val_orig) == "number" && typeof(val) == "number"){
                    var gauss = new Gauss();
                    sim = gauss.getSimilarity(val_orig, val, k); 
                    //console.log("gaussitooo "+ sim)
                }
                //Si es un valor booleano
                else if(typeof(val_orig) == "boolean" && typeof(val) == "boolean"){
                    if(val_orig == val){
                        sim = 1;
                    }
                }
                //Si es un valor de fechas
                else if(val_orig instanceof Date && val instanceof Date){
                    var gauss = new Gauss();
                    sim = gauss.getSimilarity(val_orig.getTime(), val.getTime(), k*1000*60*60*24);
                }
                //Para todo lo demas
                else{
                    sim = 0;
                }
                
                arrValues.push(sim);
            }  
            else{
                var arrsim = this.getArrSimilarity(val_orig, val, threshold, n, k);
                arrValues = arrValues.concat(arrsim);
            }
        }
    }
    //console.log("FIN CON ARRAY: "+arrValues)
    return arrValues;
}

CompareDocument.prototype.getSimilarity = function(Object, objectComparison){
    var arr = this.getArrSimilarity(Object, objectComparison, this.threshold, this.n, this.k);
   
    var cont = 0;
    for(var i=0; i<arr.length; i++){
        cont = cont + arr[i];
    }
    //console.log(arr)
    return cont/arr.length;
}

CompareDocument.prototype.containsFuzzy = function(array, element, threshold, n, k){
    
    //Comprobamos si hay algo
    if(array.length == 0){
        return false;
    }
    
    //Recorremos el array
    for(var i = 0; i<array.length; i++){
        var sim = 0;
        
        //Si los tipos no coinciden
        if(typeof(element)!=typeof(array[i]) || (typeof(element) == "object" && ((element instanceof Array && !array[i] instanceof Array) || (!element instanceof Array && array[i] instanceof Array))) || (typeof(element) == "object" && ((element instanceof Date && !array[i] instanceof Date) || (!element instanceof Date && array[i] instanceof Date)))){
            sim = 0
        }
        else if(element instanceof Array && array[i] instanceof Array){
            sim = this.getSimilarityForArrays(element, array[i], threshold, n, k);
        }
        //Si se trata de un string de tamaño corto vendrá dada por la distancia levensthein
        else if(typeof(element) == "string" && !element.includes(" ")){
            var levensthein = new Levensthein();
            sim = levensthein.getSimilarity(element, array[i]);
        }
        //si se trata de un string de tamaño más largo entonces se usa el kondrak-ngram
        else if(typeof(element) == "string" && element.includes(" ")){
            var kgram = new Ngram(n);
            sim = kgram.getSimilarity(element, array[i]);
        } 
        //Si se trata de un número se realiza la campana de gauss
        else if(typeof(element) == "number"){
            var m = element;
            var x = array[i];
            var up = (Math.pow(m-x, 2));
            var down = Math.pow(k,2)*2;
            sim = Math.exp((-1)*(up/down));
        }
        //Si se trata de un booleano no realizamos un juicio de similitud, 0 si son distintos y 1 si son iguales.
        else if(typeof(element) == "boolean"){
            if(element == array[i]){
                sim = 1;
            }
        }
        //Si se trata de una fecha, operaremos con los milisegundos, por lo que aumentamos el tamaño de la campana de gauss
        else if(element instanceof Date){
            var m = element.getTime();
            var x = array[i].getTime();
            var up = (Math.pow(m-x, 2));
            var down = Math.pow(k*1000*60*60*24,2)*2;
            sim = Math.exp((-1)*(up/down));
        }
        else{
            sim = this.getSimilarity(element, array[i]);
        }
        //console.log("simlarity of element "+JSON.stringify(element) + " " + sim);
        
        if(sim >= threshold){
            return true;
        }
    }
    
    return false;
}

CompareDocument.prototype.getSimilarityForArrays = function(array1, array2, threshold, n, k){
    
    //En primer lugar, creamos una variable que almacena el número elementos que forman el conjunto de la union
    var union = [];
    
    for(var i = 0; i<array1.length; i++){
        if(!this.containsFuzzy(union, array1[i], threshold, n, k)){
            //console.log("entra " + JSON.stringify(array1[1]))
            union.push(array1[i]);
        }
    }
    
    for(var i = 0; i<array2.length; i++){
        if(!this.containsFuzzy(union, array2[i], threshold, n, k)){
            //console.log("entra "+ JSON.stringify(array2[i]));
            union.push(array2[i]);
        }
    }
    
    var intersect = array1.length + array2.length - union.length;
    //console.log(intersect);
    return intersect / union.length;
}


module.exports = CompareDocument;
