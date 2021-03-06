var Jaccard = require('./Jaccard.js');
var Ngram = require('./Kondrak.js');
var Levensthein = require('./Levenshtein.js');


function Algorithm(name, n){
    
    //Damos valor a las propiedades
    this.name = name.toLowerCase();
    this.n = n;

    if(n == undefined && (this.name == "levenshtein" || this.name == "kondrak")){
        throw new Error("if you use a ngram based algorithm you must indicates the length of the gram");
    }

    if(this.name == "levenshtein"){
        this.algorithm = new Levensthein();
    }
    else if(this.name == "jaccard"){
        this.algorithm = new Jaccard(this.n)
    }
    else if(this.name == "kondrak"){
        this.algorithm = new Ngram(this.n);
    } 
    else {
        throw new Error("The algorithm name specified does not exist");    
    }
    
}


Algorithm.prototype.getSimilarity = function(s1, s2){
    s1 = JSON.stringify(s1);
    s2 = JSON.stringify(s2);
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    return this.algorithm.getSimilarity(s1, s2);
}



module.exports = Algorithm;