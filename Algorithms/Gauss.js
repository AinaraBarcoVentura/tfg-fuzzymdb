function Gauss(){}

Gauss.prototype.getSimilarity = function(m, x, k){
    var up = (Math.pow(m-x, 2));
    var down = Math.pow(k,2)*2;
    sim = Math.exp((-1)*(up/down));
    return sim;
}

module.exports = Gauss;



