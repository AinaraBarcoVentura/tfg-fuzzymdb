var Jaccard = require('../Algorithms/jaccard.js');
var Ngram = require('../Algorithms/kondraks_ngram.js');
var Levensthein = require('../Algorithms/levensthein.js');
var SorensenDice = require('../Algorithms/sorensen_dice.js');
var Damerau = require('../Algorithms/damerau.js');

function Algorithm(name, n){
    this.accurate = accurate;
    
    //Si la propiedad de accurate es falsa significa que se va a comparar el documento como un string completo
    if(accurate == false){
        //Damos valor a las propiedades
        this.name = name.toLowerCase();
        this.n = n;
        
        if(n == undefined && (this.name != "levensthein" && this.name != "damerau")){
            throw new Error("if you use a ngram based algorithm you must indicates the length of the gram");
        }
    
        if(this.name == "levensthein"){
            this.algorithm = new Levensthein();
        } 
        else if(this.name == "damerau"){
            this.algorithm = new Damerau();
        }
        else if(this.name == "jaccard"){
            this.algorithm = new Jaccard(this.n)
        }
        else if(this.name == "kondrakgram"){
            this.algorithm = new Ngram(this.n);
        }
        else if(this.name == "sorensen-dice"){
            this.algorithm = new SorensenDice(this.n);
        } 
        else {
            throw new Error("The algorithm name specified does not exist");    
        }
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