## Documentation

You can see below the API reference of this module.

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

