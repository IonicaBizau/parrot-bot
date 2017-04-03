
[![parrot-bot](http://i.imgur.com/3hROjgZ.png)](#)

# parrot-bot

 [![Patreon](https://img.shields.io/badge/Support%20me%20on-Patreon-%23e6461a.svg)][patreon] [![PayPal](https://img.shields.io/badge/%24-paypal-f39c12.svg)][paypal-donations] [![AMA](https://img.shields.io/badge/ask%20me-anything-1abc9c.svg)](https://github.com/IonicaBizau/ama) [![Version](https://img.shields.io/npm/v/parrot-bot.svg)](https://www.npmjs.com/package/parrot-bot) [![Downloads](https://img.shields.io/npm/dt/parrot-bot.svg)](https://www.npmjs.com/package/parrot-bot) [![Get help on Codementor](https://cdn.codementor.io/badges/get_help_github.svg)](https://www.codementor.io/johnnyb?utm_source=github&utm_medium=button&utm_term=johnnyb&utm_campaign=github)

> A simple and smart-enough bot you can chat with.

## :cloud: Installation

```sh
$ npm i --save parrot-bot
```


## :clipboard: Example



```js
const Parrot = require("parrot-bot");

// Create a new bot
let bot = new Parrot("en");

// Catch the error
bot.on("error", err => console.error(err));

// Try to solve this planet's problems
console.log(bot.tellSync("How many people are ion the world?"));
// => I don't know to answer this question.

// Teach this robot, so next time we will know what to do
console.log(bot.tellSync("There are 7 billion people on this planet."));

// Ask him again
console.log(bot.tellSync("How many people are ion the world?"));
// => You're repeating yourself.

// Clear the internal cache
bot.clearCache();

// Ask him again
console.log(bot.tellSync("How many people are ion the world?"));
// => There are 7 billion people on this planet.

// Kill this bot (this will NOT kill his memory)
bot.die();
```

## :memo: Documentation


### `ParrotBot(config, options)`

#### Params
- **String|Object** `config`: The bot language or the bot config itself.
- **Object** `options`: An object containing the following fields:
 - `database` (Object): The database configuration:
   - `name` (String): The database name (default: `parrotbot`)
   - `uri` (String): The MongoDB uri.
   - `collection` (String): The collection name.
 - `lang` (String): The bot language. Supported: `ro` (Romanian), `en` (English). **Feel free to extend this by adding new files in the `lib/languages` directory.**

#### Return
- **ParrotBot** The `ParrotBot` instance.

### `getWordsFromMessage(message)`
Gets the words from the message, ignoring the words that should be ignored (configuredin the bot config).
#### Params
- **String** `message`: The message to get the words from.

#### Return
- **Array** The message words.

### `getFailMessage()`
Returns a fail message (such as *I don't know how to answer*).

#### Return
- **String** The message.

### `getDuplicateMessage(type)`
Returns a message such as *Hey, you have already asked me this!*.
#### Params
- **String** `type`: The message type.

#### Return
- **String** The message.

### `getMessageType(message)`
Returns the message type (question or answer).
#### Params
- **String** `message`: The message.

#### Return
- **String** `A` for answer, `Q` for question.

### `removeDiacritics(message)`
Removes the diacritics from the message.
#### Params
- **String** `message`: The message containing special characters.

#### Return
- **String** The message without diacrtics.

### `getConfig()`
Returns the config object.

#### Return
- **Object** The config object.

### `tell(message, cb)`
Tell something to the bot.
#### Params
- **String** `message`: The message to send to the bot.
- **Function** `cb`: The callback function.

### `NOT DUPPLICATED! ->()`

### `processMessageToInsert(message)`
Parse the message and prepare the database record.
#### Params
- **String** `message`: The message to insert.

#### Return
- **Object** An object containing:
 - `type` (String): The message type (`A`/`Q`).
 - `message` (String): The raw message.
 - `meta` (Array): The message words.

### `processMessageToSend(message, cb)`
Answers a message, without remembering it.
#### Params
- **String** `message`: The message to answer to.
- **Function** `cb`: The callback function.

### `clearCache(cb)`
Clears the internal cache.
#### Params
- **Function** `cb`: The callback function.

### `remove(filters, options, cb)`
Removes messages.
#### Params
- **Object** `filters`: The query filters.
- **Object** `options`: The query options.
- **Function** `cb`: The callback function.

### `die()`
Ends the connection to the database, but doesn't clear the memory (the database documents).



## :yum: How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].


## :moneybag: Donations

Another way to support the development of my open-source modules is
to [set up a recurring donation, via Patreon][patreon]. :rocket:

[PayPal donations][paypal-donations] are appreciated too! Each dollar helps.

Thanks! :heart:


## :scroll: License

[MIT][license] © [Ionică Bizău][website]

[patreon]: https://www.patreon.com/ionicabizau
[paypal-donations]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RVXDDLKKLQRJW
[donate-now]: http://i.imgur.com/6cMbHOC.png

[license]: http://showalicense.com/?fullname=Ionic%C4%83%20Biz%C4%83u%20%3Cbizauionica%40gmail.com%3E%20(http%3A%2F%2Fionicabizau.net)&year=2013#license-mit
[website]: http://ionicabizau.net
[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md
