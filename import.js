console.log("> Daemon started.");

var Bot = require("./bot");
var fs = require("fs");

setTimeout(function () {
    console.log("Reading file.");
    fs.readFile("./data/fizica.txt", function (err, text) {
        if (err) { return console.log("Error reading ./data/fizica.") };

        var messages = text.toString().match( /[^\.!\?]+[\.!\?]+/g );
        console.log("Preparing to insert " + messages.length + " messages into database.");

        console.log("Inserting sentences into database.");

        for (var i in messages) {
            messages[i] = messages[i].replace(/\n/g, "").trim();

            Bot.insertMessage(messages[i], function (err, data) {
                if (err) { return console.log(JSON.stringify(err)); }
                console.log("Inserted " + data.message);
            });
        }
    });
}, 1000);
