var argv = require('optimist')
    .demand([ 'server', 'nick', 'db' ])
    .usage('$0 [db]')
    .argv
;

var DNode = require('dnode');
var Hash = require('traverse/hash');
var Store = require('supermarket');

var IRC = require('irc-js');
var Bot = require('rowbit/bot');

var Seq = require('seq');
Seq()
    .seq(function () {
        Store({ filename : argv.db, json : true }, this);
    })
    .par(function (db) {
        db.get('channels', this());
        db.get('password', this());
    })
    .seq(function (ch, pw) {
        var irc = new IRC(Hash.merge(argv, {
            channels : (ch || []).concat(argv.channels || [])
        }));
        
        DNode(function (remote, conn) {
            this.auth = function (pass, cb) {
                cb(pass == (pw || 'powsy') ? Bot(irc) : null);
            };
        }).on('localError', this);
    })
});
