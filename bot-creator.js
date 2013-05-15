// TODO An ASCII art here... O.o
// Node Chatter Bot - Copyright (C) Ionica Bizau
// ------------------------------

/* Mongo server */
var Mongo = require("mongodb");
var http = require("http");

exports.ChatterBot = function () {

    var config;
    var collection;
    var CACHE;

    /*
     *  Sets the config of the robot.
     *   {
     *       "fail": {
     *           "messages": []
     *       },
     *       "meta": {
     *          "ignore": []
     *       }
     *       "database": {
     *          "name": ...
     *          "collection": ...
     *       }
     *   }
     *
     */ 
    var init = {
        "database": function (name, col, callback) {

            var server = Mongo.Server("127.0.0.1", 27017);
            var db = new Mongo.Db(name, server, { safe: true });

            db.open(function(err, db) {
                if (err) {
                    callback("Error while opening database.");
                    process.exit(1);
                }
                
                db.collection(col, function(err, col) {
                    
                    if (err) {
                        callback("Error while finding collection. " + JSON.stringify(err));
                        process.exit(2);
                    }
                    
                    callback(null, col);
                });
            });
        },
        /*
            +=========================+
            | NATIVE FUNCTIONS:       |
            |    MESSAGE -> WORDS     |
            |    GET FAIL MESSAGE     |
            |    QUESTION OR ANSWER?  |
            |    REMOVE DIACRITICS    |
            +=========================+
        */
        "getWordsFromMessage": function (message) {

            var words = message.split(" ");
            var wordsToSend = [];

            for (var i in words) {
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
        },
        // Get fail message
        "getFailMessage": function () {
            var message = config.fail.messages[Math.floor(Math.random() * config.fail.messages.length)];
            return message;
        },
        // Get duplicate message
        "getFailMessage": function (type) {
            var message = config.duplicate.messages[type][Math.floor(Math.random() * config.duplicate.messages[type].length)];
            return message;
        },
        // Get message type
        "getMessageType": function (message) {
            
            // The message contains "?"
            if (message.indexOf("?") !== -1) {

                // The message ends with "?", so it's a question.
                if (message.indexOf("?") === message.length - 1) {
                    return  "Q";
                }

                return "Q";
            }
            
            return "A";
        },

        // Remove diacritics from message
        "removeDiacritics": function (message) {

            message = message.replace(/ă/g, "a");
            message = message.replace(/â/g, "a");
            message = message.replace(/ț/g, "t");
            message = message.replace(/ș/g, "s");
            message = message.replace(/î/g, "i");

            return message; 
        },

        "setConfig": function (configObject, callback) {
            try {
                JSON.parse(JSON.stringify(configObject));
            }
            catch(e) { return callback("Error while parsing config: " + JSON.stringify(e)); }

            // Process config
            configObject.fail = configObject.fail || {};
            configObject.fail.messages = configObject.fail.messages || ["I don't know to reply to init message."];

            configObject.meta = configObject.meta || {};

            if (configObject.cache) { CACHE = true } 

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
                
                if (err) { console.log(err) }

                collection = col;
                callback(null, config);
            });

        },
        "getConfig": function (callback) {
            callback(null, config);
        },
        // Extending memory...
        "insertMessage": function (message, callback) {
           
            if (!collection) { return callback("Collection isn't set yet."); }
            if (!message) { return callback(); }
            if (config.fail.messages.indexOf(message) !== -1) { return callback(null, null) }
            
            var duplicate = true;
            var regexArray = [];
            var words = init.getWordsFromMessage(message);

            for (var i in words) {
                regexArray.push(new RegExp("^" + words[i]));
            }

            collection.find({"meta": {$all: regexArray}}).toArray(function (err, docs) {
                
                if (err) { return callback(err); }
                if (!docs || !docs.length) { duplicate = false; }

                for (var i in docs) {
                    for (var word in docs[i].meta) {
                        if (words.indexOf(docs[i].meta[word]) === -1) {
                            duplicate = false;
                        }
                    }
                }
            
                if (duplicate) { console.log("... :-)"); return callback(); }

                var objectToInsert = init.processMessageToInsert(message);
                
                if (CACHE) {
                    config.cache.received[objectToInsert.type].push(objectToInsert.message);
                }

                collection.insert(objectToInsert, callback);
            });

        },
        // Get message
        "getMessage": function (message, callback) {

            init.processMessageToSend(message, function (err, message) {

                if (err) { return callback(err); }

                // If no message, return a question
                if (!message) {
                    collection.find({ "type": "Q"}).toArray(function (err, docs) {

                        if (err) {
                            return callback(err);
                        }

                        if (!docs || !docs.length) {

                            return callback(null, init.getFailMessage());
                            // return callback(null, "");
                        }

                        var messageToSend;
                        messageToSend = docs[Math.floor(Math.random() * docs.length)].message;
                         
                        if (CACHE && config.cache.send["Q"].indexOf(messageToSend)) {
                            messageToSend = 
                        }

                        if (CACHE) { config.cache.sent["Q"].push(messageToSend); }

                        callback(null, messageToSend);
                    });

                    return;
                }

                if (CACHE) { config.cache.sent["A"].push(message); }

                callback(null, message);
            });
        },

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
        "processMessageToInsert": function (message) {
            
            var dataToInsert = {
                "type": "",
                "message": message,
                "meta": []
            };

            dataToInsert.type = init.getMessageType(message);
            dataToInsert.meta = init.getWordsFromMessage(message);

            return dataToInsert;
        },

        ///////////////////////////////////
        // PROCESSING ANSWER TO SEND     //
        // Searching for best answer ;-) //
        ///////////////////////////////////
        "processMessageToSend": function (message, callback) {
          
            // First try to five an answer {type:"A"}
            var words = init.getWordsFromMessage(message);
            
            // If the message is an answer, return a question
            if (init.getMessageType(message) === "A") {
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
                    var answer = (bestAnswers[Math.floor(Math.random() * bestAnswers.length)] || {}).message || "";
                    callback(null, answer);

                    return;
                }

                // Answer not found, return a question
                calback(null, "");
            });
        }
    };
    return init;
};
