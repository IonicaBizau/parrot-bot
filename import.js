console.log("> Daemon started.");

var Creator = require("./bot-creator");
var fs = require("fs");

var Bot = new Creator.ChatterBot(true);

var config = {
    "fail": {
        "messages": [
            "Nu stiu ca sa raspund la acest mesaj.",
            "Inteligenta mea este limitata, totusi.",
            "Ma poti invata ca sa raspund la mesaje?",
            "Am nevoie de cineva care sa ma invete sa raspund.",
            "Eu sunt mic, nu stiu nimic.",
            "Am uitat acest lucru chiar ieri.",
            "Cred că asta nu știu, nu vreau sa risc."
        ]
    },
    "duplicate": {
        "messages": {
            "bot": [
                "Cred ca in curand nu voi mai putea raspunde.",
                "Mi se epuizeaza memoria, nu vreau ca sa mai spun ce am mai zis o data."
            ],
            "human": [
                "Cred ca te repeti.",
                "Ai mai spus asta o data.",
                "M-ai mai intrebat asta.",
                "Nu imi mai spune ce mi-ai mai spus o data."
            ]
        }
    },
    "meta": {
        "ignore": ["este"]
    },
    "database": {
        "name": "chatterbot",
        "collection": "messages"
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

Bot.setConfig(config, function (err, data) {
    if (err) { console.log(err); process.exit(1); }

    console.log("Bot initialized.");
});

setTimeout(function () {

    console.log("Reading file.");

    fs.readFile("./data/fizica.txt", function (err, text) {

        if (err) { return console.log("Error reading ./data/fizica.") };

        var messages = text.toString().match( /[^\.!\?]+[\.!\?]+/g );
        console.log("Preparing to insert " + messages.length + " messages into database.");

        console.log("Inserting sentences into database.");

        for (var i in messages) {
            messages[i] = messages[i].replace(/\n/g, "").trim();

            Bot.getAnswer(messages[i], function (err, data) {

                if (err) { return console.log(JSON.stringify(err)); }

                console.log("Inserted a new message: \"" + messages[i] + "\"\n");
            });
        }
    });
}, 1000);
