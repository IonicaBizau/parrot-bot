// TODO An ASCII art here... O.o
// Node Chatter Bot - Copyright (C) Ionica Bizau
// ------------------------------

/* Mongo server */
var Mongo = require("mongodb");
var http = require("http");

// Debug messages
levels = {
    "info":     ["\033[90m", "\033[39m"], // grey
    "error":    ["\033[31m", "\033[39m"], // red
    "exit":     ["\033[35m", "\033[39m"], // magenta
    "warning":  ["\033[36m", "\033[39m"]  // cyan
};

// The constructor for robot
exports.ChatterBot = function (debug) {

    function printInConsole (message, level) {
        level = level || "info";

        console.log(levels[level][0] + message + levels[level][1]);
    }

    if (!debug) { printInConsole = function (mess) {}; }

    var config;
    var collection;
    var CACHE;

    // TODO Is it possible to prevent to make it global?
    var dataBase;

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

            dataBase = db;

            db.open(function(err, db) {
                if (err) {
                    var message = "Error while opening database. " + JSON.stringify(err);
                    printInConsole(message, "exit");
                    return callback(message);
                }
                
                db.collection(col, function(err, col) {
                    
                    if (err) {
                        var message = "Error while finding collection. " + JSON.stringify(err);
                        printInConsole(message, "exit");
                        return callback(message);
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

            if (!message) return [];

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
        "getDuplicateMessage": function (type) {
            var duplicateMessages = config.duplicate.messages;
            printInConsole(duplicateMessages);
            var message = duplicateMessages[type][Math.floor(Math.random() * duplicateMessages[type].length)];
            printInConsole(" * " + message);
            return message;
        },
        // Get message type
        "getMessageType": function (message) {
            
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

            if (configObject.cache) { 
                CACHE = true; 
                printInConsole("Cache is true."); 
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
                
                if (err) { return callback(err); }

                collection = col;
                callback(null, config);
            });

        },
        "getConfig": function (callback) {
            callback(null, config);
        },
        ///////////////////////////////////////
        // GET ANSWER: THE MOST IMPORTANT    //
        // FUNCTION OF THE ROBOT             //
        // The message is passed and in      //
        // the callback the second argument  //
        // is the answer of the robot        //
        ///////////////////////////////////////
        "getAnswer": function (message, callback) {
            printInConsole("Messege received: " + message, "exit");
            
            if (!collection) { return callback("Collection isn't set yet."); }
            // if (!message) { return callback(); }
            // Don't insert fail messages in database.
            // if (config.fail.messages.indexOf(message) !== -1) { return callback(null, null) }
           

            ///////////////////////////////
            // IS THIS A DUPLICATE MESSAGE?
            ///////////////////////////////
            var duplicate = true;
            var regexArray = [];
            var words = init.getWordsFromMessage(message);

            printInConsole("Found " + words.length + " words: " + JSON.stringify(words), "exit");
            for (var i in words) { 
                printInConsole("Adding " + words[i], "exit");
                var item = new RegExp("^" + words[i]);
                printInConsole("> Item: " + item, "error");
                regexArray.push(item); 
            }
           
            printInConsole("--------------------------", "warning");
            printInConsole("A new message to filter...", "warning");
            printInConsole("Message: " + message, "warning");
            printInConsole("Words: " + JSON.stringify(words), "warning");
            printInConsole("RegexArray:", "warning");
            printInConsole(regexArray, "error");

            // Find docs with these words
            collection.find({ "meta": { $all: regexArray }}).toArray(function (err, docs) {
               
                printInConsole("Found " + docs.length + " docs");

                if (err) { return callback(err); }
                if (!docs || !docs.length) { duplicate = false; }

                // Search in each document the words.
                for (var i in docs) {
                    for (var word in docs[i].meta) {
                        // If ONE word is NOT duplicated, then 
                        // the message isn't duplicated
                        var keyword = docs[i].meta[word];
/* NOT DUPPLICATED! ->*/if (words.indexOf(keyword) === -1 && config.meta.ignore.indexOf(keyword) === -1) {
                            duplicate = false;
                            break;
                        }
                    }
                }

                printInConsole("> Duplicate: " + duplicate, "warning");

                // Prepare object to insert
                var objectToInsert = init.processMessageToInsert(message);
                
                // If the message is NOT duplicated, insert it.
                if (!duplicate && objectToInsert.message) {
                    collection.insert(objectToInsert, function (err, insertedDoc) {
                        if (err) { return printInConsole(err, "error"); }

                        printInConsole("Inserted successfully a new message in database.", "exit");
                    });
                }

                // Message to insert data
                var messageData = init.processMessageToInsert(message);
                var messageToSend = "";

                if (messageData.message) {
                    if (CACHE && config.cache.received[messageData.type].indexOf(messageData.message) !== -1) {
                        messageToSend = init.getDuplicateMessage("human");
                        return callback(null, messageToSend);
                    }
                    else
                    if (CACHE) { config.cache.sent["A"].push(message); }
                }
                
                if (CACHE) { config.cache.received[messageData.type].push(messageData.message); }

                var messageReceived = init.processMessageToInsert(message);   

                // Process messages to send
                init.processMessageToSend(message, function (err, message) {

                    if (err) { return callback(err); }

                    printInConsole("Message: " +  message);

                    if (message === "<!>") {
                        printInConsole("Returning an empty string.", "warning");
                        callback(null, "");
                        return;
                    }

                    if (message === "<A>") {
                        callback(null, init.getFailMessage());
                        return;
                    }

                    if (!message) {
                        collection.find({ "type": "Q"}).toArray(function (err, docs) {

                            if (err) { return callback(err); }
                            // No questions found.
                            if (!docs || !docs.length) { 
                                printInConsole("No docs found");

                                callback(null, init.getFailMessage()); 
                            }

                            messageToSend = docs[Math.floor(Math.random() * docs.length)].message;

                            if (CACHE && config.cache.sent["Q"].indexOf(messageToSend) !== -1) {
                                messageToSend = init.getDuplicateMessage("bot");
                            }
                            else
                            if (CACHE) { config.cache.sent["Q"].push(messageToSend); }

                            callback(null, (messageReceived.type === "Q" ? "<%>" : "") + messageToSend);
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

                    callback(null, message);
                });
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
            
            printInConsole("Message: " + message, "info");

            // First try to five an answer {type:"A"}
            var words = init.getWordsFromMessage(message);
           
            if (!message || !words || !words.length) {

                collection.find({ "type": "Q" }).toArray(function(err, docs) {
                    if (err) { return callback(err); }
                    if (!docs || !docs.length) { return callback(null, init.getFailMessage()); }
                
                    var l = docs.length;
                    var randQuestion = (docs[Math.floor(Math.random() * l)]).message;
                    if (!randQuestion) { return callback(null, init.getFailMessage()); }

                    if (CACHE && config.cache.sent["Q"].indexOf(randQuestion) !== -1) {
                        randQuestion = init.getDuplicateMessage("bot");
                    }
                    else
                    if (CACHE) { config.cache.sent["Q"].push(randQuestion); }

                    callback(null, randQuestion);
                });
                return;
            }

            // If the message is an answer, return a question
            if (init.getMessageType(message) === "A") {
                printInConsole("The message is an answer or an affirmation.", "info");
                return callback(null, "<!>");
            }
            
            printInConsole("The message is a question.", "info");
            
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
                    
                    var answer = (bestAnswers[Math.floor(Math.random() * bestAnswers.length)] || {}).message || "<A>";
                    callback(null, answer);

                    return;
                }

                // Answer not found, return a question
                calback(null, "");
            });
        },
        "clearCache": function (callback) {
            if (!CACHE) { return callback("Cache has to be enabled."); } 
            config.cache = config.temp.cache;
            callback(null, "Successfully cleared cache.");
        },
        "remove": function (filters, options, callback) {
            if (!filters) { return callback("Missing filters object."); }
            
            if (typeof options === "function") {
                callback = options;
                options = {};
            }

            collection.remove(filters, options, callback);
        },
        "duplicateMemory": function (colOne, colTwo, callback) {

            printInConsole("Preparing to duplicate " + colOne + " in "+ colTwo + ".", "warning");

            dataBase.collection(colOne, function(err, col) {
                if (err) { return callback(err); } 

                col.find().toArray(function (err, data) {
                    if (err) { return callback(err); } 
                
                    printInConsole("Clonning " + colOne, "warning");
                    
                    dataBase.collection(colTwo, function (err, col) {
                        if (err) { return callback(err); } 
                        
                        printInConsole("Inserting " + data.length + " documents in " + colTwo, "warning");
                        col.insert(data, function (err, result) {
                            if (err) { return callback(err); } 
                            
                            callback(null, result);
                        });
                    });
                });
            });
        }
    };

    return init;
};
