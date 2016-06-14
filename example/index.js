"use strict";

const Parrot = require("..");

let bot = new Parrot({
    messages: {
        fail: [
            "Nu stiu ca sa raspund la acest mesaj.",
            "Inteligenta mea este limitata, totusi.",
            "Ma poti invata ca sa raspund la mesaje?",
            "Am nevoie de cineva care sa ma invete sa raspund.",
            "Eu sunt mic, nu stiu nimic.",
            "Am uitat acest lucru chiar ieri.",
            "Cred că asta nu știu, nu vreau sa risc."
        ]
      , duplicate: {
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
    }
  , meta: {
        "ignore": ["este"]
    }
  , database: {
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
});

bot.getAnswer("This is a great day!", (err, message) => {
    bot.getAnswer("How are you today?", (err, message) => {
        console.log(err || message);
    });
});
