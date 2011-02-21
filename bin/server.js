var argv = require('optimist')
    .demand(1)
    .check(function (argv) {
        return Boolean(argv._[0].match(/.:\d+$/))
    })
    .argv
;

var DNode = require('dnode');
var Hash = require('traverse/hash');
var Store = require('supermarket');
var IRC = require('irc').Client;

var Seq = require('seq');
Seq()
    .seq('db', function () {
        Store({ filename : __dirname + '/../rowbit.db', json : true }, this);
    })
    .par(function (db) { db.get('channels', this) })
    .par(function (db) { db.get('nick', this) })
    .par(function (db) { db.get('password', this) })
    .par(function (db) { db.get('secret', this) })
    .seq(function (ch, nick, pw, secret) {
        var channels = (ch || []).concat((argv.channels || '').split(','));
        if (argv.password) pw = argv.password;
        if (argv.nick) nick = argv.nick;

        //server, nick, options        
        var irc = new IRC( argv._[0].split(/:/)[0],
                           nick || 'rowbit',
                           { port : argv._[0].split(/:/)[1],
                             channels: channels
                           }
                         );

        // "Emitted when the server sends the message of the day to clients. 
        // This (at least as far as I know) is the most reliable way to know when
        // you've connected to the server." --node-irc docs
        irc.on('motd', function () {
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
                            irc : Hash.map(irc, function (f) {
                                return typeof f == 'function'
                                    ? f.bind(irc) : f
                            }),
                            get : function (key, cb) {
                                if (restricted(key)) cb('ACCESS DENIED');
                                else db.get(key, cb);
                            },
                            set : function (key, value, cb) {
                                if (restricted(key)) cb('ACCESS DENIED');
                                else db.set(key, value, cb);
                            },
                        });
                    }
                };
            }).on('localError', this).listen(5050);
        }).bind(this));
    })
;
