"use strict";

const Mongo = require("mongodb")
    , Logger = require("bug-killer")
    , ul = require("ul")
    ;

module.exports = class ParrotBot {

    constructor (config, options) {
        this.config = ul.deepMerge(config, {
            messages: {
                fail: []
              , duplicate: {
                    bot: []
                  , human: []
                }
            }
          , meta: {
                ignore: []
            }
        });

        this.options = ul.deepMerge(options, {
            database: {
                name: "parrotbot"
              , collection: "messages"
            }
        });

        this.debug = this.options.debug;
        this.cache = {
            received: {
                A: []
              , Q: []
            },
            sent: {
                A: []
              , Q: []
            }
        };

        if (!debug) { Logger.log_level = 0; }
    }

    database (name, col, cb) {

        let server = Mongo.Server("127.0.0.1", 27017);
        let db = new Mongo.Db(name, server, { safe: true });

        db.open((err, db) => {

            if (err) {
                let message = "Error while opening database. " + JSON.stringify(err);
                Logger.log(message, "exit");
                return cb(message);
            }

            this.db = db;

            db.collection(col, (err, col) => {

                if (err) {
                    let message = "Error while finding collection. " + JSON.stringify(err);
                    Logger.log(message, "exit");
                    return cb(message);
                }

                this.db_col = col;

                cb(null, col);
            });
        });
    }

    getWordsFromMessage (message) {

        /*
            +=========================+
            | NATIVE FUNCTIONS:       |
            |    MESSAGE -> WORDS     |
            |    GET FAIL MESSAGE     |
            |    QUESTION OR ANSWER?  |
            |    REMOVE DIACRITICS    |
            +=========================+
        */

        if (!message) return [];

        let words = message.split(" ");
        let wordsToSend = [];

        for (let i in words) {
            words[i] = init.removeDiacritics(words[i]);
            words[i] = words[i]
                        .replace(new RegExp(/[^a-zA-Z0-9 -]/g), "")
                        .toLowerCase()
                        .trim();

            // TODO How do we must to filter keywords?
            if (words[i].length > 3 && config.meta.ignore.indexOf(words[i]) === -1) {
                wordsToSend.push(words[i]);
            }
        }

        return wordsToSend;
    }
    getFailMessage () {
        let message = config.fail.messages[
            Math.floor(Math.random() * config.fail.messages.length)
        ];
        return message;
    }
    getDuplicateMessage (type) {
        let duplicateMessages = config.duplicate.messages;
        Logger.log(duplicateMessages);
        let message = duplicateMessages[type][Math.floor(Math.random() * duplicateMessages[type].length)];
        Logger.log(" * " + message);
        return message;
    }
    getMessageType (message) {

        if (!message) { return "A"; }

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
    removeDiacritics (message) {

        message = message.replace(/ă/g, "a");
        message = message.replace(/â/g, "a");
        message = message.replace(/ț/g, "t");
        message = message.replace(/ș/g, "s");
        message = message.replace(/î/g, "i");

        return message;
    }

    setConfig (configObject, cb) {
        try {
            JSON.parse(JSON.stringify(configObject));
        } catch(e) {
            return cb("Error while parsing config: " + JSON.stringify(e));
        }

        // Process config
        configObject.fail = configObject.fail || {};
        configObject.fail.messages = configObject.fail.messages || ["I don't know to reply to init message."];

        configObject.meta = configObject.meta || {};

        if (configObject.cache) {
            CACHE = true;
            Logger.log("Cache is true.");
            configObject.temp = {};
            configObject.temp.cache = configObject.cache;
        }

        // This will come from the place where is created the robot
        // configObject.cache = {
        //     "received": {
        //         "A": [],
        //         "Q": []
        //     },
        //     "sent": {
        //         "A": [],
        //         "Q": []
        //     }
        // };

        // config = JSON.parse(JSON.stringify(configObject));

        config = configObject;

        init.database(config.database.name, config.database.collection, function (err, col) {

            if (err) { return cb(err); }

            collection = col;
            cb(null, config);
        });
    }
    getConfig (cb) {
        cb(null, config);
    }

    ///////////////////////////////////////
    // GET ANSWER: THE MOST IMPORTANT    //
    // FUNCTION OF THE ROBOT             //
    // The message is passed and in      //
    // the cb the second argument  //
    // is the answer of the robot        //
    ///////////////////////////////////////
    getAnswer (message, cb) {
        Logger.log("Messege received: " + message, "exit");

        if (!collection) { return cb("Collection isn't set yet."); }
        // if (!message) { return cb(); }
        // Don't insert fail messages in database.
        // if (config.fail.messages.indexOf(message) !== -1) { return cb(null, null) }


        ///////////////////////////////
        // IS THIS A DUPLICATE MESSAGE?
        ///////////////////////////////
        let duplicate = true;
        let regexArray = [];
        let words = init.getWordsFromMessage(message);

        Logger.log("Found " + words.length + " words: " + JSON.stringify(words), "exit");
        for (let i in words) {
            Logger.log("Adding " + words[i], "exit");
            let item = new RegExp("^" + words[i]);
            Logger.log("> Item: " + item, "error");
            regexArray.push(item);
        }

        Logger.log("--------------------------", "warning");
        Logger.log("A new message to filter...", "warning");
        Logger.log("Message: " + message, "warning");
        Logger.log("Words: " + JSON.stringify(words), "warning");
        Logger.log("RegexArray:", "warning");
        Logger.log(regexArray, "error");

        // Find docs with these words
        collection.find({ "meta": { $all: regexArray }}).toArray(function (err, docs) {

            Logger.log("Found " + docs.length + " docs");

            if (err) { return cb(err); }
            if (!docs || !docs.length) { duplicate = false; }

            // Search in each document the words.
            for (let i in docs) {
                for (let word in docs[i].meta) {
                    // If ONE word is NOT duplicated, then
                    // the message isn't duplicated
                    let keyword = docs[i].meta[word];
/* NOT DUPPLICATED! ->*/if (words.indexOf(keyword) === -1 && config.meta.ignore.indexOf(keyword) === -1) {
                        duplicate = false;
                        break;
                    }
                }
            }

            Logger.log("> Duplicate: " + duplicate, "warning");

            // Prepare object to insert
            let objectToInsert = init.processMessageToInsert(message);

            // If the message is NOT duplicated, insert it.
            if (!duplicate && objectToInsert.message) {
                collection.insert(objectToInsert, function (err, insertedDoc) {
                    if (err) { return Logger.log(err, "error"); }

                    Logger.log("Inserted successfully a new message in database.", "exit");
                });
            }

            // Message to insert data
            let messageData = init.processMessageToInsert(message);
            let messageToSend = "";

            if (messageData.message) {
                if (CACHE && config.cache.received[messageData.type].indexOf(messageData.message) !== -1) {
                    messageToSend = init.getDuplicateMessage("human");
                    return cb(null, messageToSend);
                }
                else
                if (CACHE) { config.cache.sent["A"].push(message); }
            }

            if (CACHE) { config.cache.received[messageData.type].push(messageData.message); }

            let messageReceived = init.processMessageToInsert(message);

            // Process messages to send
            init.processMessageToSend(message, function (err, message) {

                if (err) { return cb(err); }

                Logger.log("Message: " +  message);

                if (message === "<!>") {
                    Logger.log("Returning an empty string.", "warning");
                    cb(null, "");
                    return;
                }

                if (message === "<A>") {
                    cb(null, init.getFailMessage());
                    return;
                }

                if (!message) {
                    collection.find({ "type": "Q"}).toArray(function (err, docs) {

                        if (err) { return cb(err); }
                        // No questions found.
                        if (!docs || !docs.length) {
                            Logger.log("No docs found");

                            cb(null, init.getFailMessage());
                        }

                        messageToSend = docs[Math.floor(Math.random() * docs.length)].message;

                        if (CACHE && config.cache.sent["Q"].indexOf(messageToSend) !== -1) {
                            messageToSend = init.getDuplicateMessage("bot");
                        }
                        else
                        if (CACHE) { config.cache.sent["Q"].push(messageToSend); }

                        cb(null, (messageReceived.type === "Q" ? "<%>" : "") + messageToSend);
                    });

                    return;
                }

                if (messageReceived.message)
                if (CACHE && config.cache.received[messageReceived.type].indexOf(messageReceived.message) !== -1) {
                    messageToSend = init.getDuplicateMessage("human");
                }
                else
                if (CACHE && config.cache.sent["A"].indexOf(message) !== -1) {
                    message = init.getDuplicateMessage("human");
                }
                else
                if (CACHE) { config.cache.sent["A"].push(message); }

                cb(null, message);
            });
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
    processMessageToInsert function (message) {

        let dataToInsert = {
            "type": "",
            "message": message,
            "meta": []
        };

        dataToInsert.type = init.getMessageType(message);
        dataToInsert.meta = init.getWordsFromMessage(message);

        return dataToInsert;
    }
    ///////////////////////////////////
    // PROCESSING ANSWER TO SEND     //
    // Searching for best answer ;-) //
    ///////////////////////////////////
    processMessageToSend (message, cb) {

        Logger.log("Message: " + message, "info");

        // First try to five an answer {type:"A"}
        let words = init.getWordsFromMessage(message);

        if (!message || !words || !words.length) {

            collection.find({ "type": "Q" }).toArray(function(err, docs) {
                if (err) { return cb(err); }
                if (!docs || !docs.length) { return cb(null, init.getFailMessage()); }

                let l = docs.length;
                let randQuestion = (docs[Math.floor(Math.random() * l)]).message;
                if (!randQuestion) { return cb(null, init.getFailMessage()); }

                if (CACHE && config.cache.sent["Q"].indexOf(randQuestion) !== -1) {
                    randQuestion = init.getDuplicateMessage("bot");
                }
                else
                if (CACHE) { config.cache.sent["Q"].push(randQuestion); }

                cb(null, randQuestion);
            });
            return;
        }

        // If the message is an answer, return a question
        if (init.getMessageType(message) === "A") {
            Logger.log("The message is an answer or an affirmation.", "info");
            return cb(null, "<!>");
        }

        Logger.log("The message is a question.", "info");

        // The message is a question for robot, find answers.
        collection.find({ "type": "A" }).toArray(function(err, docs) {

            if (err) { return cb(err); }

            let filter = {};
            let max = 0;

            // Answer found
            if (docs || docs.length) {
                // Scan every doc
                for (let doc in docs) {

                    let why = [];

                    // Scanning current doc
                    let power = 0;
                    for (let word in words) {
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

                let bestAnswers = filter[max] || [];

                let answer = (bestAnswers[Math.floor(Math.random() * bestAnswers.length)] || {}).message || "<A>";
                cb(null, answer);

                return;
            }

            // Answer not found, return a question
            calback(null, "");
        });
    }
    clearCache (cb) {
        if (!CACHE) { return cb("Cache has to be enabled."); }
        config.cache = config.temp.cache;
        cb(null, "Successfully cleared cache.");
    }
    remove (filters, options, cb) {
        if (!filters) { return cb("Missing filters object."); }

        if (typeof options === "function") {
            cb = options;
            options = {};
        }

        collection.remove(filters, options, cb);
    },
    duplicateMemory (colOne, colTwo, cb) {

        Logger.log("Preparing to duplicate " + colOne + " in "+ colTwo + ".", "warning");

        this.db.collection(colOne, function(err, col) {
            if (err) { return cb(err); }

            col.find().toArray(function (err, data) {
                if (err) { return cb(err); }

                Logger.log("Clonning " + colOne, "warning");

                this.db.collection(colTwo, function (err, col) {
                    if (err) { return cb(err); }

                    Logger.log("Inserting " + data.length + " documents in " + colTwo, "warning");
                    col.insert(data, function (err, result) {
                        if (err) { return cb(err); }

                        cb(null, result);
                    });
                });
            });
        });
    }
};
