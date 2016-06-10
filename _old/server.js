// Requirements
var http = require("http");
var static = require("node-static");
var Speech = require("./speech");

// Node static: public folder 
var public = new(static.Server)("./public");

// Bot creator
var Creator = require("./bot-creator");
var Bot = new Creator.ChatterBot(true);

// About
require("./about");

// Config of the robot
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

Bot.setConfig(config, function (err) {
    if (err) { console.log("Error while setting config for robot."); return process.exit(1); }
});

// Create http server    
http.createServer(function (req, res) {

    if (req.url === "/get") {
        
        var sentData = "";

        req.on("data", function (data) {
            sentData += data.toString();
        });

        req.on("end", function () {
            
            if (!sentData) { return res.end("Missing data."); }

            try {
                sentData = JSON.parse(sentData);
            }
            catch (e) {
                return res.end("Invalid data.");
            }

            var message = sentData.message;
            var talk = sentData.talk;

            // Get message from robot
            Bot.getAnswer(message, function (err, message) {
     
                if (err) { return res.end(JSON.stringify(err)); }

                // Fail message + question
                if (message.indexOf("<%>") !== -1) {
                    message = message.replace("<%>", "");
                    message = Bot.getFailMessage() + " " + message;
                }

                var dataToSend = { message: message };

                

                // If talk === true, send mp3 link. 
                if (talk) {

                    Speech.ro(message, function (err, mp3Link) {

                        dataToSend.mp3Link = mp3Link;

                        if (err) { return res.end(JSON.stringify(dataToSend, null, 4)) }
                
                        res.end(JSON.stringify(dataToSend, null, 4));
                    });

                    return;
                }
                res.end(JSON.stringify(dataToSend, null, 4));
            });
        });

        return;
    }

    if (req.url === "/clearCache") {
        Bot.clearCache(function (err) {
            res.end(err || "");
        });
        return;
    }

    // Serve files from public directory
    public.serve(req, res, function (err) {
        if (err) { public.serveFile("/404.html", 404, {}, req, res); }
    });
}).listen(3000);
