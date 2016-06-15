"use strict";

const Parrot = require("..")
    , prompt = require('prompt')
    ;

// Create a new bot
let bot = new Parrot("en");

prompt.start();

let commands = {
    die: () => bot.die()
  , clear_cache: () => bot.clearCache()
};

let doAsync = () => {
    prompt.get("message", (err, result) => {
        if (err) { return console.error(err); }

        result = result.message;
        if (result.startsWith("/")) {
            let com = result.substring(1);
            if (commands[com]) {
                commands[com]();
            } else {
                console.log(`Invalid command: ${result}. Available commands are: ${Object.keys(commands).join(", ")}`);
            }
            return doAsync();
        }

        bot.tell(result, (err, data) => {
            if (err) { return console.error(err); }
            data && console.log(data);
            doAsync();
        });
    });
}

doAsync();
