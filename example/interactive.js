"use strict";

const Parrot = require("..")
    , prompt = require('promptify')
    ;

// Create a new bot
let bot = new Parrot("en");

let commands = {
    die: () => {
        bot.die();
        process.exit();
    }
  , clear_cache: () => bot.clearCache()
  , "new": (name, lang) => {
        try {
            bot = new Parrot(lang, { name: name });
            console.log(`Now you're talking to ${name}.`);
        } catch (e) {
            console.log(e);
        }
    }
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

        /clearCache
          Clears the current robot internal cache.

    By default, you're talking to Alice.

                          - - -

                        E n j o y !
`);

let prompted = null;
while (prompted = prompt(">", { delimiter: " " })) {
    if (prompted.startsWith("/")) {
        let com = prompted.substring(1).split(" ");
        if (commands[com[0]]) {
            commands[com[0]].apply(this, com.slice(1));
        } else {
            console.log(`Invalid command: ${prompted}. Available commands are: ${Object.keys(commands).join(", ")}`);
        }
        return doAsync();
    }
    console.log(bot.tellSync(prompted));
}
