var Shingles = require('../Utils/Shingles.js');

function SorensenDice(n){
    this.n = n;
}

SorensenDice.prototype.getSimilarity = function(s0,s1){
    
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
    var s01 = s.getShingles(s1);
    
    var i = 0;
    var j = 0;
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
    
    var inter = 0;
    
    for(i = 0; i<union.length; i++){
        var bools0 = 0;
        var bools1 = 0;
        for(j = 0; j<s0a.length; j++){
            if (s0a[j][0] == union[i]){
                bools0 = 1;
            }
        }
        for(j = 0; j<s1a.length; j++){
            if (s1a[j][0] == union[i]){
                bools1 = 1;
            }
        }
        
        if(bools0 == 1 && bools1 == 1){
            inter++;
        }
    }
    
    return 2.0 * inter / (s0a.length + s1a.length);
}

module.exports = SorensenDice;

