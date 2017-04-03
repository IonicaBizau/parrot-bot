"use strict";

const mongoose = require("mongoose")
    , Logger = require("bug-killer")
    , ul = require("ul")
    , diacritics = require("diacritics").remove
    , EventEmitter = require("events").EventEmitter
    , deffy = require("deffy")
    , deasync = require("deasync")
    , noop = require("noop6")
    , uniqueRandArr = require("unique-random-array")
    , mapO = require("map-o")
    ;

mongoose.Promise = Promise;

const DEFAULT_CACHE = {
    received: {
        A: []
      , Q: []
    }
  , sent: {
        A: []
      , Q: []
    }
};

class ParrotBot extends EventEmitter {

    /**
     * ParrotBot
     *
     * @name ParrotBot
     * @function
     * @param {String|Object} config The bot language or the bot config itself.
     * @param {Object} options An object containing the following fields:
     *
     *  - `database` (Object): The database configuration:
     *    - `name` (String): The database name (default: `parrotbot`)
     *    - `uri` (String): The MongoDB uri.
     *    - `collection` (String): The collection name.
     *  - `lang` (String): The bot language. Supported: `ro` (Romanian), `en` (English). **Feel free to extend this by adding new files in the `lib/languages` directory.**
     *
     * @returns {ParrotBot} The `ParrotBot` instance.
     */
    constructor (config, options) {

        super();

        if (typeof config === "string") {
            config = { lang: config };
        }

        config = config || {};

        let lang = config.lang
          , conf = ParrotBot.languages[lang]
          ;

        if (conf) {
            config = conf;
        }

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
            database: {}
          , name: "Alice"
        });

        let db = this.options.database;
        db.name = db.name || "parrotbot";
        db.uri = db.uri || `mongodb://localhost/${db.name}`;
        db.collection = db.collection || `messages_${this.options.name.toLowerCase()}${ lang ? "_" + lang : ""}`;

        this._db = mongoose.createConnection(db.uri, (err, data) => {
            if (err) {
                this.emit("error", err);
            } else {
                this.emit("connected");
            }
        });

        this.Message = this._db.model("Message", {
            type: String
          , message: {
                type: String
              , unique: true
              , dropDups: true
            }
          , meta: [String]
        }, db.collection);

        this._col = this._db.collection(db.collection);
        this.duplicateMessages = mapO(this.config.messages.duplicate, uniqueRandArr, true);
        this.failMessageRandom = uniqueRandArr(this.config.messages.fail);

        this.debug = this.options.debug;
        this.useCache = deffy(this.options.cache, true);
        this.clearCache();

        if (!this.debug) { Logger.config.level = 0; }
        this.tellSync = deasync(this.tell);
    }

    /**
     * getWordsFromMessage
     * Gets the words from the message, ignoring the words that should be ignored (configuredin the bot config).
     *
     * @name getWordsFromMessage
     * @function
     * @param {String} message The message to get the words from.
     * @returns {Array} The message words.
     */
    getWordsFromMessage (message) {

        // +=========================+
        // | NATIVE FUNCTIONS:       |
        // |    MESSAGE -> WORDS     |
        // |    GET FAIL MESSAGE     |
        // |    QUESTION OR ANSWER?  |
        // |    REMOVE DIACRITICS    |
        // +=========================+

        if (!message) return [];

        let words = message.split(" ");
        let wordsToSend = [];

        for (let i in words) {
            words[i] = this.removeDiacritics(words[i]);
            words[i] = words[i]
                        .replace(new RegExp(/[^a-zA-Z0-9 -]/g), "")
                        .toLowerCase()
                        .trim();

            if (words[i].length > 3 && this.config.meta.ignore.indexOf(words[i]) === -1) {
                wordsToSend.push(words[i]);
            }
        }

        return wordsToSend;
    }

    /**
     * getFailMessage
     * Returns a fail message (such as *I don't know how to answer*).
     *
     * @name getFailMessage
     * @function
     * @returns {String} The message.
     */
    getFailMessage () {
        return this.failMessageRandom();
    }

    /**
     * getDuplicateMessage
     * Returns a message such as *Hey, you have already asked me this!*.
     *
     * @name getDuplicateMessage
     * @function
     * @param {String} type The message type.
     * @returns {String} The message.
     */
    getDuplicateMessage (type) {
        return this.duplicateMessages[type]();
    }

    /**
     * getMessageType
     * Returns the message type (question or answer).
     *
     * @name getMessageType
     * @function
     * @param {String} message The message.
     * @returns {String} `A` for answer, `Q` for question.
     */
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

    /**
     * removeDiacritics
     * Removes the diacritics from the message.
     *
     * @name removeDiacritics
     * @function
     * @param {String} message The message containing special characters.
     * @returns {String} The message without diacrtics.
     */
    removeDiacritics (message) {
        return diacritics(message);
    }

    /**
     * getConfig
     * Returns the config object.
     *
     * @name getConfig
     * @function
     * @returns {Object} The config object.
     */
    getConfig () {
        return this.config;
    }

    /**
     * tell
     * Tell something to the bot.
     *
     * @name tell
     * @function
     * @param {String} message The message to send to the bot.
     * @param {Function} cb The callback function.
     */
    tell (message, cb) {
        Logger.log("Messege received: " + message, "exit");

        // if (!message) { return cb(); }
        // Don't insert fail messages in database.
        // if (config.fail.messages.indexOf(message) !== -1) { return cb(null, null) }

        ///////////////////////////////
        // IS THIS A DUPLICATE MESSAGE?
        ///////////////////////////////
        let duplicate = true;
        let regexArray = [];
        let words = this.getWordsFromMessage(message);

        Logger.log("Found " + words.length + " words: " + JSON.stringify(words), "exit");
        for (let i in words) {
            Logger.log("Adding " + words[i], "exit");
            let item = new RegExp("^" + words[i]);
            Logger.log("> Item: " + item);
            regexArray.push(item);
        }

        Logger.log("--------------------------", "warning");
        Logger.log("A new message to filter...", "warning");
        Logger.log("Message: " + message, "warning");
        Logger.log("Words: " + JSON.stringify(words));
        Logger.log("RegexArray:", "warning");
        Logger.log(regexArray, "error");

        // Find docs with these words
        this.Message.find({
            "meta": { $all: regexArray }
        }, (err, docs) => {

            Logger.log("Found " + docs.length + " docs");

            if (err) { return cb(err); }
            if (!docs || !docs.length) { duplicate = false; }

            // Search in each document the words.
            for (let i in docs) {
                for (let word in docs[i].meta) {
                    // If ONE word is NOT duplicated, then
                    // the message isn't duplicated
                    let keyword = docs[i].meta[word];
                        if (words.indexOf(keyword) === -1 && this.config.meta.ignore.indexOf(keyword) === -1) {
                        duplicate = false;
                        break;
                    }
                }
            }

            Logger.log("> Duplicate: " + duplicate, "warning");

            // Prepare object to insert
            let objectToInsert = this.processMessageToInsert(message);

            // If the message is NOT duplicated, insert it.
            if (!duplicate && objectToInsert.message) {
                let newMsg = new this.Message(objectToInsert);

                newMsg.save((err, insertedDoc) => {
                    if (err) { return Logger.log(err, "error"); }
                    Logger.log("Inserted successfully a new message in database.", "exit");
                });
            }

            // Message to insert data
            let messageData = this.processMessageToInsert(message);
            let messageToSend = "";
            let config = this.config;

            if (messageData.message) {
                if (this.useCache && this.cache.received[messageData.type].indexOf(messageData.message) !== -1) {
                    messageToSend = this.getDuplicateMessage("human");
                    return cb(null, messageToSend);
                }
                else
                if (this.useCache) { this.cache.sent["A"].push(message); }
            }

            if (this.useCache) { this.cache.received[messageData.type].push(messageData.message); }

            let messageReceived = this.processMessageToInsert(message);

            // Process messages to send
            this.processMessageToSend(message, (err, message) => {

                if (err) { return cb(err); }

                Logger.log("Message: " +  message);

                if (message === "<!>") {
                    Logger.log("Returning an empty string.", "warning");
                    cb(null, "");
                    return;
                }

                if (message === "<A>") {
                    cb(null, this.getFailMessage());
                    return;
                }

                if (!message) {
                    this.Message.find({ "type": "Q"}, (err, docs) => {

                        if (err) { return cb(err); }
                        // No questions found.
                        if (!docs || !docs.length) {
                            Logger.log("No docs found");

                            cb(null, this.getFailMessage());
                        }

                        messageToSend = docs[Math.floor(Math.random() * docs.length)].message;

                        if (this.useCache && this.cache.sent["Q"].indexOf(messageToSend) !== -1) {
                            messageToSend = this.getDuplicateMessage("bot");
                        }
                        else
                        if (this.useCache) { this.cache.sent["Q"].push(messageToSend); }

                        cb(null, (messageReceived.type === "Q" ? "<%>" : "") + messageToSend);
                    });

                    return;
                }

                if (messageReceived.message)
                if (this.useCache && this.cache.received[messageReceived.type].indexOf(messageReceived.message) !== -1) {
                    messageToSend = this.getDuplicateMessage("human");
                }
                else
                if (this.useCache && this.cache.sent["A"].indexOf(message) !== -1) {
                    message = this.getDuplicateMessage("human");
                }
                else
                if (this.useCache) { this.cache.sent["A"].push(message); }

                cb(null, message);
            });
        });
    }


    // +==============================================+
    // |.           .   *     .            *   .      |
    // | R 0 B 0 T          .     +    .           .  |
    // |   .     .  M € M 0 R Y              .        |
    // |      . +      .        0 P € R @ T I 0 N S + |
    // +==============================================+

    /**
     * processMessageToInsert
     * Parse the message and prepare the database record.
     *
     * @name processMessageToInsert
     * @function
     * @param {String} message The message to insert.
     * @returns {Object} An object containing:
     *
     *  - `type` (String): The message type (`A`/`Q`).
     *  - `message` (String): The raw message.
     *  - `meta` (Array): The message words.
     */
    processMessageToInsert (message) {

        let dataToInsert = {
            "type": "",
            "message": message,
            "meta": []
        };

        dataToInsert.type = this.getMessageType(message);
        dataToInsert.meta = this.getWordsFromMessage(message);

        return dataToInsert;
    }

    /**
     * processMessageToSend
     * Answers a message, without remembering it.
     *
     * @name processMessageToSend
     * @function
     * @param {String} message The message to answer to.
     * @param {Function} cb The callback function.
     */
    processMessageToSend (message, cb) {

        Logger.log("Message: " + message, "info");

        // First try to five an answer {type:"A"}
        let words = this.getWordsFromMessage(message);

        if (!message || !words || !words.length) {

            this.Message.find({ "type": "Q" }, (err, docs) => {
                if (err) { return cb(err); }
                if (!docs || !docs.length) { return cb(null, this.getFailMessage()); }

                let l = docs.length;
                let randQuestion = (docs[Math.floor(Math.random() * l)]).message;
                if (!randQuestion) { return cb(null, this.getFailMessage()); }

                if (this.useCache && this.cache.sent["Q"].indexOf(randQuestion) !== -1) {
                    randQuestion = this.getDuplicateMessage("bot");
                } else if (this.useCache) { this.cache.sent["Q"].push(randQuestion); }

                cb(null, randQuestion);
            });
            return;
        }

        // If the message is an answer, return a question
        if (this.getMessageType(message) === "A") {
            Logger.log("The message is an answer or an affirmation.", "info");
            return cb(null, "<!>");
        }

        Logger.log("The message is a question.", "info");

        // The message is a question for robot, find answers.
        this.Message.find({ "type": "A" }, (err, docs) => {

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

    /**
     * clearCache
     * Clears the internal cache.
     *
     * @name clearCache
     * @function
     * @param {Function} cb The callback function.
     */
    clearCache (cb) {
        cb = cb || noop;
        if (!this.useCache) { return cb("Cache has to be enabled."); }
        this.cache = ul.clone(DEFAULT_CACHE);
        cb(null, "Successfully cleared cache.");
    }

    /**
     * remove
     * Removes messages.
     *
     * @name remove
     * @function
     * @param {Object} filters The query filters.
     * @param {Object} options The query options.
     * @param {Function} cb The callback function.
     */
    remove (filters, options, cb) {
        if (!filters) { return cb("Missing filters object."); }

        if (typeof options === "function") {
            cb = options;
            options = {};
        }

        this.Message.remove(filters, options, cb);
    }

    /**
     * die
     * Ends the connection to the database, but doesn't clear the memory (the database documents).
     *
     * @name die
     * @function
     */
    die () {
        this._db.close();
    }
};

ParrotBot.languages = require("./languages");

module.exports = ParrotBot;
