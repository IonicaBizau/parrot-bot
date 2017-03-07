// TODO An ASCII art here... O.o
// Node Chatter Bot - Copyright (C) Ionica Bizau
// ------------------------------

var TIMEOUT = 1000;
var cache = {
    "Q": []
};

// TODO Create a custom config from server.js
var botConfig = {
    // TODO OBSOLETE, DEPRECATED? Yeah.
    "extend": {
        // Ține minte asta: "Fizica este o știință minunată."
        // {
        //   "type": "A",
        //   "message": "Fizica este o știință minunată."
        //   "meta": ["fizica", "este", "o", "știință", "minunată"]
        // }
        "value": ["memoreaza", "tine minte", "ține minte", "cand te voi întreba"],
        "selectors": ["\""]
    },
    "fail": {
        "messages": [
            "Nu stiu ca sa raspund la acest messaj.",
            "Inteligenta mea este limitata, totusi.",
            "Ma poti invata ca sa raspund la mesaje?",
            "Am nevoie de cineva care sa ma invete sa raspund.",
            "Eu sunt mic, nu stiu nimic.",
            "Am uitat acest lucru chiar ieri.",
            "Cred că asta nu știu."
        ]
    },
    "meta": {
        // Any word that we want to ignore from meta array.
        "ignore": ["este"]
    }
};

/* Mongo server */
var Mongo = require("mongodb");
var http = require("http");

var server = Mongo.Server("127.0.0.1", 27017);
var db = new Mongo.Db("chatterbot", server, { safe: true });
var collection;

console.log("Opening database.");

db.open(function(err, db) {
    if (err) {
        console.log("Error while opening database.");
        process.exit(1);
    }
    
    console.log("Finding collection.");
    db.collection("messages", function(err, col) {
        
        if (err) {
            console.log("Error while finding collection. " + JSON.stringify(err));
            process.exit(2);
        }
        
        console.log("Collection found.");
        collection = col;
    });
});

// Extending memory...
exports.insertMessage = function (message, callback) {
   
    if (!collection) { return callback("Collection isn't setted yet."); }
    if (!message) { return callback(); }

    // TODO Don't insert duplicate messages:
    //          - create an array of inserted messages
    //          - verify
    //          - Insert if (... === -1)

    var objectToInsert = processMessageToInsert(message);
    collection.insert(objectToInsert, callback);
}

// Get message
exports.getMessage = function (message, callback) {

    processMessageToSend(message, function (err, message) {
        
        if (err) { return callback(err); }

        // If no message, return a question
        if (!message) {
            collection.find({ "type": "Q"}).toArray(function (err, docs) {

                if (err) {
                    return callback(err);
                }

                if (!docs || !docs.length) {
   //                 return callback(null, getFailMessage());
                    return callback(null, "");
                }

                var messageToSend;
                messageToSend = docs[Math.floor(Math.random() * docs.length)].message;
                var search = true;
                
                while (cache.Q.indexOf(messageToSend && search) !== -1) {
                    messageToSend = docs[Math.floor(Math.random() * docs.length)].message;
                }


//                 callback(null, "Nu stiu ce să zic, dar te întreb eu ceva. " + messageToSend);
                callback(null, "");
            });

            return;
        }

        callback(null, message);
    });
}

/*
    +==============================================+
    |.           .   *     .            *   .      |
    | R 0 B 0 T          .     +    .           .  |
    |   .     .  M € M 0 R Y              .        |
    |      . +      .        0 P € R @ T I 0 N S + |
    +==============================================+
*/

///////////////////////////////////
// THE BOT IS EVOLUTING. YEAH!   //
// What can be more interesting? //
///////////////////////////////////
function processMessageToInsert(message) {
    
    var dataToInsert = {
        "type": "",
        "message": message,
        "meta": []
    };

    // We have here a extend memory process
//    for (var i in botConfig.extend.value) {
//        
//        if (message.toLowerCase().indexOf(botConfig.extend.value[i])) {
//
//            var firstSelector = message.indexOf(botConfig.extend.selectors);
//            var lastSelector = message.lastIndexOf(botConfig.extend.selectors);
//            
//            if (firstSelector !== lastSelector && firstSelector !== -1 && lastSelector !== -1) {
//                message = message.substring(firstSelector, lastSelector);
//                
//                // Success!
//                if (message) {
//                    dataToInsert.message = message;
//                    dataToInsert.type = "A";
//                    dataToInsert.meta = getWordsFromMessage(message);
//                    return dataToInsert;
//                }
//            }
//        }
//    }

    dataToInsert.type = getMessageType(message);
    dataToInsert.meta = getWordsFromMessage(message);

    return dataToInsert;
}

///////////////////////////////////
// PROCESSING ANSWER TO SEND     //
// Searching for best answer ;-) //
///////////////////////////////////
function processMessageToSend(message, callback) {
  
    // First try to five an answer {type:"A"}
    var words = getWordsFromMessage(message);
    var regExpArray = [];

    // Create regular expresion
    for(var i in words) {
        var regExp = new RegExp("^" + words[i]);
        regExpArray.push(regExp);
    }

    // If the message is an answer, return a question
    if (getMessageType(message) === "A") {
        return callback(null, "");
    }

    // The message is a question for robot, find answers.
    collection.find({ "type": "A" }).toArray(function(err, docs) {

        if (err) { return callback(err); }
        
        var filter = {};
        var max = 0;

        // Answer found
        if (docs || docs.length) {
            // Scan every doc
            for (var doc in docs) {

                var why = [];

                // Scanning current doc 
                var power = 0;
                for (var word in words) {
                    if (docs[doc].meta.indexOf(words[word]) !== -1) {
                        ++power;
                        why.push(words[word]);
                    }
                }

                if (power !== 0) {
                    if (!filter[power.toString()]) {
                        filter[power.toString()] = [];
                    }
                    docs[doc].why = why;
                    filter[power.toString()].push(docs[doc]);
                    if (power > max) {
                        max = power;
                    }
                }
            }

            var bestAnswers = filter[max] || [];
            console.log("$", JSON.stringify(filter, null, 4));
            var answer = (bestAnswers[Math.floor(Math.random() * bestAnswers.length)] || {}).message || getFailMessage();
            callback(null, answer);

            return;
        }

        // Answer not found, return a question
        calback(null, "");
    });
}


/*
    +=========================+
    | NATIVE FUNCTIONS:       |
    |    MESSAGE -> WORDS     |
    |    GET FAIL MESSAGE     |
    |    QUESTION OR ANSWER?  |
    |    REMOVE DIACRITICS    |
    +=========================+
*/
function getWordsFromMessage (message) {

    var words = message.split(" ");
    var wordsToSend = [];

    for (var i in words) {
        words[i] = removeDiacritics(words[i]);
        words[i] = words[i]
                    .replace(new RegExp(/[^a-zA-Z0-9 -]/g), "")
                    .toLowerCase()
                    .trim();

        // TODO How do we must to filter keywords?
        if (words[i].length > 3 && botConfig.meta.ignore.indexOf(words[i]) === -1) {
            wordsToSend.push(words[i]);
        }
    }

    return wordsToSend;
}


// Get fail message
function getFailMessage () {
    var message = botConfig.fail.messages[Math.floor(Math.random() * botConfig.fail.messages.length)];
    var search = true;

    while(search && cache.Q.indexOf(message) !== -1) {
         message = botConfig.fail.messages[Math.floor(Math.random() * botConfig.fail.messages.length)];
    }

//    setTimeout(function() {
//        search = false;
//        message = "Mi s-au epuizat ideile... Mai invata-ma tu ceva.";
//        return message;
//    }, TIMEOUT);

//    cache.Q.push(message);

    return message;
}

// Get message type
function getMessageType (message) {
    
    // The message contains "?"
    if (message.indexOf("?") !== -1) {

        // The message ends with "?", so it's a question.
        if (message.indexOf("?") === message.length - 1) {
            return  "Q";
        }

        return "Q";
    }
    
    return "A";
}

// Remove diacritics from message
function removeDiacritics(message) {

    message = message.replace(/ă/g, "a");
    message = message.replace(/â/g, "a");
    message = message.replace(/ț/g, "t");
    message = message.replace(/ș/g, "s");
    message = message.replace(/î/g, "i");

    return message; 
}
