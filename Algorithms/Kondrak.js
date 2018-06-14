function kondraks_ngram (n){
    this.n = n;
}

kondraks_ngram.prototype.getDistance = function(s0, s1){
    if (s0 == null) {
        throw new Error("s0 must not be null");
    }
    if (s1 == null) {
        throw new Error("s1 must not be null");
    }
    if (s1 === s0) {
        return 0;
    }

    var special = '\n';
    var sl = s0.length;
    var tl = s1.length;
    if (sl === 0 || tl === 0) {
        return 1;
    }
    var cost = 0;
    if (sl < this.n || tl < this.n) {
        for (var i_1 = 0, ni = Math.min(sl, tl); i_1 < ni; i_1++) {
            if (s0.charAt(i_1) == s1.charAt(i_1)) {
                cost++;
            }
        }
    
        return cost / Math.max(sl, tl);
    }

    var sa = new Array(sl + this.n - 1);
    
    for (var i_2 = 0; i_2 < sa.length; i_2++) {
        if (i_2 < this.n - 1) {
            sa[i_2] = special;
        }
        else {
            sa[i_2] = s0.charAt(i_2 - this.n + 1);
        }
    }

    var d2;
    var p = new Array(sl + 1);
    var d = new Array(sl + 1);
    for(var i_3 = 0; i_3 < sl + 1; i_3++){
        p[i_3] = 0.0;
        p[i_3] = 0.0;
    }

    var i;
    var j;
    var t_j = new Array(this.n);
    for (i = 0; i <= sl; i++) {
        p[i] = i;
    }
    for (j = 1; j <= tl; j++) {
        if (j < this.n) {
            for (var ti = 0; ti < this.n - j; ti++) {
                t_j[ti] = special;
            }
            
            for (var ti = this.n - j; ti < this.n; ti++) {
                t_j[ti] = s1.charAt(ti - (this.n - j));
            }
        }
        else {
            t_j = (s1.substring(j - this.n, j)).split('');
        }
        d[0] = j;
        for (i = 1; i <= sl; i++) {
            cost = 0;
            var tn = this.n;
            for (var ni = 0; ni < this.n; ni++) {
                if (sa[i - 1 + ni] != t_j[ni]) {
                    cost++;
                }
                else if (sa[i - 1 + ni] == special) {
                    tn--;
                }
            }
            var ec = cost / tn;
            d[i] = Math.min(Math.min(d[i - 1] + 1, p[i] + 1), p[i - 1] + ec);
        }
        d2 = p;
        p = d;
        d = d2;
    }
    return p[sl] / Math.max(tl, sl);
}

kondraks_ngram.prototype.getSimilarity = function(s0,s1){
    var distance = this.getDistance(s0,s1);
    return 1-distance;
}

module.exports = kondraks_ngram;
