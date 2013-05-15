var Creator = require("./bot-creator");

var Bot1 = Creator.ChatterBot();
var Bot2 = Creator.ChatterBot();

var config1 = { 
    "fail": {
        "messages": [
            "Nu stiu ca sa raspund la acest messaj.",
            "Inteligenta mea este limitata, totusi.",
            "Ma poti invata ca sa raspund la mesaje?",
            "Am nevoie de cineva care sa ma invete sa raspund.",
            "Eu sunt mic, nu stiu nimic.",
            "Am uitat acest lucru chiar ieri.",
            "Cred că asta nu știu, nu vreau sa risc."
        ]
    },
    "meta": {
        "ignore": ["este"]
    },
    "database": {
        "name": "chatterbot",
        "collection": "messages_three"
    }
};

var config2 = { 
    "fail": {
        "messages": [
            "Eu sunt cel mai prost robot. Trebuie sa ma înveți de la zero.",
            "Eu nu am vorbit cu nimeni pana acum.",
            "Nu cred ca ti-ai dori sa vorbesti cu mine."
        ]
    },
    "meta": {
        "ignore": ["este"]
    },
    "database": {
        "name": "chatterbot",
        "collection": "messages"
    }
};


Bot1.setConfig(config1, function (err) {
    Bot2.setConfig(config2, function (err) {
         /* Incepe converatia */
        setTimeout(function () {
            start("Ce faci?"); 
        }, 1000);
    });
});

var robot1 = true;

function start(message) {
    
    console.log("Robot2 > " + message);
    
    Bot1.insertMessage(message, function (err) {
        if (err) { console.log("> Eroare: ", err); process.exit(1); }

        Bot1.getMessage(message, function(err, message) {
            if (err) { console.log("> Eroare: ", err); process.exit(1); }
            
            console.log("Robot1 > " + message);

            Bot2.insertMessage(message, function (err) {
                if (err) { console.log("> Eroare: ", err); process.exit(1); }
                
                Bot2.getMessage(message, function (err, message) {
                    if (err) { console.log("> Eroare: ", err); process.exit(1); }
                    
                    setTimeout(function () {
                        start(message);
                    }, 3000);
                });
            });
        });
    });
}
