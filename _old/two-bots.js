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
        "collection": "messages_two"
    },
    "duplicate": {
        "messages": {
            "bot": [
                "Cred ca in curand nu voi mai putea raspunde."
            ],
            "human": [
                "Cred ca te repeti."
            ]
        }
    },
    "cache": {
        "received": {
            "A": [],
            "Q": []
        },
        "sent": {
            "A": [],
            "Q": []
        }
    }
};

var config2 = { 
    "fail": {
        "messages": [
            "Eu sunt cel mai neajutorat robot. Trebuie sa ma înveți de la zero. Mie îmi poți „turna cu pâlnia...”, pentru că eu nu sunt om.",
            "Eu nu am vorbit cu nimeni pana acum.",
            "Nu cred ca ti-ai dori sa vorbesti cu mine."
        ]
    },
    "meta": {
        "ignore": ["este"]
    },
    "database": {
        "name": "chatterbot",
        "collection": "messages_two"
    },
    "duplicate": {
        "messages": {
            "bot": [
                "Cred ca in curand nu voi mai putea raspunde."
            ],
            "human": [
                "Cred ca te repeti."
            ]
        }
    },
    "cache": {
        "received": {
            "A": [],
            "Q": []
        },
        "sent": {
            "A": [],
            "Q": []
        }
    }
};

// Set config for BOT1
Bot1.setConfig(config1, function (err) {
    
    if (err) { console.log("FATAL ERROR: " + err); process.exit(1); }
    
    // duplicateMemory collection for BOT1
    Bot1.duplicateMemory("messages", "messages_two", function (err, data) {
        if (err) { console.log("Warning: " + err); }
        else console.log("Sucessfully duplicate memoryd database: " + data.length + " documents.");

        // Set config for BOT2
        Bot2.setConfig(config2, function (err) {
            if (err) { console.log("Warning: " + err); process.exit(2); }

            // duplicateMemory collection for BOT2
            Bot2.duplicateMemory("messages", "messages_three", function (err, data) {
        
                if (err) { console.log("Warning: " + err); }
                else console.log("Sucessfully duplicate memoryd database: " + data.length + " documents.");

                console.log("+----------------------------------------+");

                // start
                setTimeout(function () {
                    start("Ce este reflexia luminii?"); 
                }, 1000);
            });
        });
    });
});

var robot1 = true;

function start(message) {
    
    if (!message) { message = Bot2.getFailMessage(); }

    // Fail message + question
    if (message.indexOf("<%>") !== -1) {
        message = message.replace("<%>", "");
        console.log("Robot2 > " + message);
        message = "";
    }
    else {
        console.log("Robot2 > " + message);
    }
    
    var failMessages1 = config1.fail.messages;
    var failMessages2 = config2.fail.messages;
    
    // It's a fail message
    if (failMessages1.indexOf(message) > -1 || failMessages2.indexOf(message) > -1) {
        message = ""; 
    }

    Bot1.getAnswer(message, function(err, message) {
        if (err) { console.log("> Eroare: ", err); process.exit(1); }
        if (!message) { message = Bot1.getFailMessage(); }
            
        // Fail message + question
        if (message.indexOf("<%>") !== -1) {
            message = message.replace("<%>", "");
            console.log("Robot1 > " + message);
            message = "";
        }
        else {
            console.log("Robot1 > " + message);
        }
        
        var failMessages1 = config1.fail.messages;
        var failMessages2 = config2.fail.messages;
        
        // It's a fail message
        if (failMessages1.indexOf(message) > -1 || failMessages2.indexOf(message) > -1) {
            message = ""; 
        }

        setTimeout(function () {

            Bot2.getAnswer(message, function (err, message) {
                
                if (err) { console.log("> Eroare: ", err); process.exit(1); }
                
                setTimeout(function () {
                    start(message);
                }, 3000);
            });
        }, 3000);
    });
}
