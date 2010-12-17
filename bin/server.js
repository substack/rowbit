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
var IRC = require('irc-js');

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
        
        var irc = new IRC({
            server : argv._[0].split(/:/)[0],
            port : argv._[0].split(/:/)[1],
            nick : nick || 'rowbit',
            encoding : 'utf8',
        });
        if (!irc.on) irc.on = irc.addListener.bind(irc);
        
        var gotPing = false;
        setInterval(function () {
            if (!gotPing) process.exit();
            gotPing = false;
        }, 5 * 60 * 1000);
        
        irc.on('ping', function () {
            gotPing = true;
        });
        
        irc.connect((function () {
            if (pw) irc.privmsg('nickserv', 'identify ' + pw);
            channels.forEach(irc.join.bind(irc));
            
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
