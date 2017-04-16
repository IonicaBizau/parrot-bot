
[![parrot-bot](http://i.imgur.com/3hROjgZ.png)](#)

# parrot-bot

 [![Support me on Patreon][badge_patreon]][patreon] [![Buy me a book][badge_amazon]][amazon] [![PayPal][badge_paypal_donate]][paypal-donations] [![Version](https://img.shields.io/npm/v/parrot-bot.svg)](https://www.npmjs.com/package/parrot-bot) [![Downloads](https://img.shields.io/npm/dt/parrot-bot.svg)](https://www.npmjs.com/package/parrot-bot)

> A parrot-like bot you can talk with.

## Online demo

You can talk to the Parrot, by visiting [`parrot.ionicabizau.net`](https://parrot.ionicabizau.net). See below how to use it.


[![](http://i.imgur.com/BLE5iI2.png)](https://parrot.ionicabizau.net)

## How it works

The *Parrot Bot* doesn't know anything in the beginning. *You* have to teach them to give answers. The answers you will eventually get from the bot will be your own words, hence the name: *Parrot Bot*. 🐦

Enjoy! :tada:


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
console.log(bot.tellSync("How many people are in the world?"));
// => I don't know to answer this questin.

// Teach this robot, so next time we will know what to do
bot.tellSync("There are 7 billion people on this planet.");

// Ask him again
console.log(bot.tellSync("How many people are in the world?"));
// => You're repeating yourself.

// Clear the internal cache
bot.clearCache();

// Ask him again
console.log(bot.tellSync("How many people are in the world?"));
// => There are 7 billion people on this planet.

// Kill this bot (this will NOT kill his memory)
bot.die();
```

## :question: Get Help

There are few ways to get help:

 1. Please [post questions on Stack Overflow](https://stackoverflow.com/questions/ask). You can open issues with questions, as long you add a link to your Stack Overflow question.
 2. For bug reports and feature requests, open issues. :bug:
 3. For direct and quick help from me, you can [use Codementor](https://www.codementor.io/johnnyb). :rocket:


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


## :sparkling_heart: Support my projects

I open-source almost everything I can, and I try to reply everyone needing help using these projects. Obviously,
this takes time. You can integrate and use these projects in your applications *for free*! You can even change the source code and redistribute (even resell it).

However, if you get some profit from this or just want to encourage me to continue creating stuff, there are few ways you can do it:

 - Starring and sharing the projects you like :rocket:
 - [![PayPal][badge_paypal]][paypal-donations]—You can make one-time donations via PayPal. I'll probably buy a ~~coffee~~ tea. :tea:
 - [![Support me on Patreon][badge_patreon]][patreon]—Set up a recurring monthly donation and you will get interesting news about what I'm doing (things that I don't share with everyone).
 - **Bitcoin**—You can send me bitcoins at this address (or scanning the code below): `1P9BRsmazNQcuyTxEqveUsnf5CERdq35V6`

    ![](https://i.imgur.com/z6OQI95.png)

Thanks! :heart:



## :scroll: License

[MIT][license] © [Ionică Bizău][website]

[badge_patreon]: http://ionicabizau.github.io/badges/patreon.svg
[badge_amazon]: http://ionicabizau.github.io/badges/amazon.svg
[badge_paypal]: http://ionicabizau.github.io/badges/paypal.svg
[badge_paypal_donate]: http://ionicabizau.github.io/badges/paypal_donate.svg
[patreon]: https://www.patreon.com/ionicabizau
[amazon]: http://amzn.eu/hRo9sIZ
[paypal-donations]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RVXDDLKKLQRJW
[donate-now]: http://i.imgur.com/6cMbHOC.png

[license]: http://showalicense.com/?fullname=Ionic%C4%83%20Biz%C4%83u%20%3Cbizauionica%40gmail.com%3E%20(http%3A%2F%2Fionicabizau.net)&year=2013#license-mit
[website]: http://ionicabizau.net
[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md
