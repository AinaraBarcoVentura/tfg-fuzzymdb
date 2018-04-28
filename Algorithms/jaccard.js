var Shingles = require('../Utils/Shingles.js');

function Jaccard(n){
    this.n = n;
}

Jaccard.prototype.getSimilarity = function(s0, s1){
    
    if(s0 == undefined){
        throw new Error("The first parameter cannot be null");
    }
    
    if(s1 == undefined){
        throw new Error("The second parameter cannot be null");
    }
    
    if(s1 === s0){
        return 1;
    }
    
    var s = new Shingles(this.n);
    var s0a = s.getShingles(s0);
    var s1a = s.getShingles(s1);
    
    var i = 0;
    //Union
    var union = [];
    //introduces the first shingles
    for(i = 0; i<s0a.length; i++){
        if(!union.includes(s0a[i][0])){
            union.push(s0a[i][0]);
        }
    }
    
    for(i = 0; i<s1a.length; i++){
        if(!union.includes(s1a[i][0])){
            union.push(s1a[i][0]);
        }
    }
    
    //intersection
    var intersect = s0a.length + s1a.length - union.length;
    
    return 1.0 * intersect / union.length;
}


module.exports = Jaccard;
