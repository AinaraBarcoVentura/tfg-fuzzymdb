var ora = require('ora');


var Spinner = function(){
    this.spin = new ora();
    this.spin.color = 'blue';
    this.spin.spinner = {
		"interval": 80,
		"frames": [
			"[    ]",
			"[=   ]",
			"[==  ]",
			"[=== ]",
			"[ ===]",
			"[  ==]",
			"[   =]",
			"[    ]",
			"[   =]",
			"[  ==]",
			"[ ===]",
			"[====]",
			"[=== ]",
			"[==  ]",
			"[=   ]"
		]
    }
    this.spin.interval = 55;
    this.spin.text = 'Processing'
}

module.exports = Spinner;