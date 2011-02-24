var argv = require('optimist')
    .demand(1)
    .check(function (argv) {
        return Boolean(argv._[0].match(/.:\d+$/))
    })
    .argv
;

var DNode = require('dnode');
var Hash = require('hashish');
var IRC = require('irc').Client;

var fs = require('fs');
var config = JSON.parse(fs.readFileSync(__dirname + '/../rowbit.json', 'utf8'));

var channels = (argv.channels && argv.channels.split(',')) || config.channels;
var secret = argv.secret || config.secret;

//server, nick, options        
var host = argv._[0].split(/:/)[0];
var port = argv._[0].split(/:/)[1];

var irc = new IRC(host, argv.nick || config.nick || 'rowbit', {
    port : port,
    channels : channels
});

irc.on('error', function (err) {
    console.error(err);
});

// This is to allow older stuff written for the js-irc version to keep
// working, maybe.

irc.privmsg = function(chan, msg) {
    console.log('Warning: This is deprecated! Use irc.say instead.');
    irc.say(chan, msg);
};

// "Emitted when the server sends the message of the day to clients. 
// This (at least as far as I know) is the most reliable way to know
// when you've connected to the server." --node-irc docs
irc.on('motd', function () {
    var pw = argv.password || config.password;
    if (pw) irc.say('nickserv', 'identify ' + pw);
    
    function restricted (key) {
        return key == 'password' || key == 'secret';
    }
    
    DNode(function (remote, conn) {
        this.auth = function (sec, cb) {
            if (sec !== secret) {
                cb('ACCESS DENIED');
            }
            else {
                cb(null, {
                    irc : (function () {
                        var i = Hash.map(irc, function (f) {
                            return typeof f == 'function'
                                ? f.bind(irc) : f
                        });
                        
                        Object.keys(IRC.prototype)
                            .filter(function (key) {
                                return typeof i[key] === 'function'
                            })
                            .forEach(function (key) {
                                i[key] = i[key].bind(i);
                            })
                        ;
                        
                        return i;
                    })(),
                    get : function (key, cb) {
                        if (restricted(key)) cb('ACCESS DENIED')
                        else cb(config[key])
                    },
                    set : function (key, value, cb) {
                        if (restricted(key)) cb('ACCESS DENIED');
                        else {
                            config[key] = value;
                            cb(null);
                        }
                    },
                });
            }
        };
    }).listen(config.server.port);
});
