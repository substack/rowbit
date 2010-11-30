var Bot = require('../lib/bot.js');
var channel = process.argv[2];

Bot(function (bot, vars) {
    bot.irc.part(channel);
    vars.conn.end();
});
