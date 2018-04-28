var damerau = function(){}

damerau.prototype.getSimilarity = function(s0,s1){
    
    if(s0 == undefined){
        throw new Error("The first parameter cannot be null");
    }
    
    if(s1 == undefined){
        throw new Error("The second parameter cannot be null");
    }
    
    if(s1 === s0){
        return 0;
    }
    
    /*
    //Inifnite distance is the max posible distance
    var inf = s0.length + s1.length;
    
    //Create and initialize the character array indices
    da = [];
    for(var d = 0; d < s0.length; d++){
        var da_elem = [];
        da_elem.push(s0.charAt(d));
        da_elem.push(0);
        da.push(da_elem);
    }
    for(var d = 0; d < s1.length; d++){
        var da_elem = [];
        da_elem.push(s1.charAt(d));
        da_elem.push(0);
        da.push(da_elem);
    }
    
    // Create the distance matrix H[0 .. s1.length+1][0 .. s2.length+1]
    var h = new Array(s0.length + 2);
    for(var i = 0; i<h.length; i++){
        h[i] = new Array(s1.length + 2);
    }
    
    // initialize the left and top edges of H
    for(var i = 0; i<=s0.length; i++){
        h[i+1][0] = inf;
        h[i+1][1] = i;
    }
    
    for(var i = 0; i<=s1.length; i++){
        h[0][i+1] = inf;
        h[1][i+1] = i;
    }
    
    // fill in the distance matrix H
    // look at each character in s1
    for(var i = 1; i<=s0.length; i++){
        var db = 0;
        
        // look at each character in b
        for(var j = 1; j<=s1.lenght; j++){
            var i1 = da[s1.charAt(j-1)] ;
            var j1 = db;
        }
    }*/
    
    return 1;
}