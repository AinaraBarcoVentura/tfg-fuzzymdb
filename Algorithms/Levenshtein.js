var levensthein = function(){}

levensthein.prototype.getDistance = function(s1,s2){
    if(s1 == undefined){
        throw new Error("The first parameter cannot be null");
    }
    
    if(s2 == undefined){
        throw new Error("The second parameter cannot be null");
    }
    
    if(s1 === s2){
        return 0;
    }
    
    if(s1.length == 0){
        return s2.length;
    }
    
    if(s2.length == 0){
        return s1.length;
    }
    
   
    
    //Create two vectors for work
    var v0 = new Array(s2.length + 1);
    var v1 = new Array(s2.length + 1);
    var vtemp = [];
    
    //Initialize v0 (the previous row of distances)
    //this row is  A[0][i]: edit distance for an empty s
    //the distance is just the number of characters to delete from t
    
    for (var i = 0; i<v0.length; i++){
        v0[i] = i;
    }
    
    for(var i = 0; i<s1.length; i++){
        //Calculate v1 (current row distances) from the previous row v0
        //first element of v1 is A[i+1][0]
        //edit distance is delete (i+1) chars from s to match empty t
        v1[0] = i + 1;
        
        //Use formula to fill in the rest of the row
        for(var j = 0; j<s2.length; j++){
            var cost = 1;
            if(s1.charAt(i) == s2.charAt(j)){
                cost = 0;
            }
            v1[j + 1] = Math.min(v1[j] + 1, Math.min(v0[j+1] + 1, v0[j] + cost));
        }
        vtemp = v0;
        v0 = v1;
        v1 = vtemp;
    }
    
    return v0[s2.length];
}

levensthein.prototype.getDistanceNormalized = function(s1,s2){
    
    var maxim_length = Math.max(s1.length, s2.length);
    
    return this.getDistance(s1,s2) / maxim_length;
}

levensthein.prototype.getSimilarity = function(s1,s2){
    
    var maxim_length = Math.max(s1.length, s2.length);
    
    return (1-(this.getDistance(s1,s2)/maxim_length));
}

module.exports = levensthein;

