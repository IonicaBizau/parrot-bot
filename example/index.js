"use strict";

const Parrot = require("..");

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
