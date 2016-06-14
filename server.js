Bot.setConfig(config, function (err) {
    if (err) { console.log("Error while setting config for robot."); return process.exit(1); }
});

// Create http server
http.createServer(function (req, res) {

            // Get message from robot
            Bot.getAnswer(message, function (err, message) {

                // Fail message + question
                if (message.indexOf("<%>") !== -1) {
                    message = message.replace("<%>", "");
                    message = Bot.getFailMessage() + " " + message;
                }

                var dataToSend = { message: message };

                res.end(JSON.stringify(dataToSend, null, 4));
            });
        });
