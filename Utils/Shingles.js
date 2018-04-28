function Shingles(n){
    this.n = n;
}

Shingles.prototype.getShingles = function(s){
    var HashMap = [];
    
    var s_nospaces = s.replace(/\s/g,'').toLowerCase();
    
    for(var i = 0; i < s_nospaces.length - this.n + 1; i++ ){
        var shingle = s_nospaces.substring(i, i+this.n);
        var old_value = 0;
        var index = -1;
        
        for(var j = 0; j<HashMap.length; j++){
            if( shingle == HashMap[j][0]){
                old_value = HashMap[j][1];
                index = j;
            }
        }
        
        var map = [];
        map.push(shingle);
        
        if(old_value == 0){
            map.push(1);
            HashMap.push(map);
        }
        else {
            map.push(old_value + 1);
            HashMap[index] = map;
        }
    }
    
    return HashMap;
}

module.exports = Shingles;
