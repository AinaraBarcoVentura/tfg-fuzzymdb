var fuzzy = require('./Core/MDBFuzzy.js'); 

var fuzzymdb = function(options){
    this.f = new fuzzy(options.connection_string);
    this.database = options.database;
    this.collection = options.collection;
    this.threshold = options.threshold;
    this.accurate = options.accurate;
    this.algorithm = options.algorithm;
    this.n = options.n;
    this.k = options.k;
}

fuzzymdb.prototype.insertOneFuzzy = function(object, callback){
    this.f.insertOneFuzzy(object, this.database, this.collection, this.threshold, this.accurate, function(err, result){
        callback(err, result);
    }, this.n, this.k, this.algorithm);
}

fuzzymdb.prototype.insertManyFuzzy = function(arrayObjects, callback){
    this.f.insertManyFuzzy(arrayObjects, this.database, this.collection, this.threshold, this.accurate, function(err, result){
        callback(err, result);
    }, this.n, this.k, this.algorithm);
}

fuzzymdb.prototype.cleanCollection = function(callback){
    this.f.cleanCollection(this.database, this.collection,  this.threshold, this.accurate, function(err, result){
        callback(err, result);
    }, this.n, this.k, this.algorithm);
}

fuzzymdb.prototype.findSimilarDocuments = function(object, callback){
    this.f.findSimilarDocuments(object, this.database, this.collection, this.threshold, this.accurate, function(err, result){
        callback(err, result);
    }, this.n, this.k, this.algorithm);
}



module.exports = fuzzymdb;