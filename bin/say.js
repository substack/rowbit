var Bot = require('../lib/bot.js');
var channel = process.argv[2];
var msg = process.argv.slice(3).join(' ');

Bot(function (bot, vars) {
    bot.irc.say(channel, msg);
    vars.conn.end();
});
