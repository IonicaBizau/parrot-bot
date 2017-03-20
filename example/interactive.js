"use strict";

const Parrot = require("..")
    , prompt = require('prompt')
    , abs = require("abs")
    , readFile = require("read-utf8")
    ;

// Create a new bot
let bot = new Parrot("en");

prompt.colors = false;
prompt.delimiter = "";
prompt.message = ""
prompt.start();

let commands = {
    die: () => {
        bot.die();
        process.exit();
    }
  , clear_cache: () => bot.clearCache()
  , "new": (name, lang) => {
        bot = new Parrot(lang, { name: name });
        console.log(`Now you're talking to ${name}.`);
    }
  , import: filename => {
        const lines = readFile(abs(filename)).split("\n");
        console.log(`Importing ${lines.length} messages.`);
        lines.forEach((c, index) => {
            if (index % 500 === 0) {
                console.log(`${index}/${lines.length}`);
            }
            bot.tellSync(c);
        });
        commands.clear_cache();
        console.log("Done.");
    }
};

let doAsync = () => {
    prompt.get(">", (err, result) => {
        if (err) { return console.error(err); }
        result = result[">"];
        if (result.startsWith("/")) {
            let com = result.substring(1).split(" ");
            if (commands[com[0]]) {
                commands[com[0]].apply(this, com.slice(1));
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
};

console.log(`
    Welcome to the ParrotBot shell.
    ===============================
    Here you can talk and teach a real robot. :D

    Simply write your message and press <Enter>.
    If you submit an empty message, the robot will
    probably decide to ask you a question.

    If you want to run a specific action on the
    robot, use the commands (messages starting with "/").

    Available commands:

        /new <name> <language>
          Creates a new robot. Don't forget to give
          him/her a name. You can use this feature
          to teach a specific robot things on a known
          subject (e.g. physics).

          If there is already a robot with this name
          and language, the memory will taken from
          the database.

        /die
          Kills the current robot. This will not
          delete their memory.

        /clear_cache
          Clears the current robot internal cache.

    By default, you're talking to Alice.

                          - - -

                        E n j o y !
`);

bot.on("connected", () => {
    doAsync();
});
