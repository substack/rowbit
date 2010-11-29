var argv = require('optimist')
    .demand([ 'server', 'nick' ])
    .check(function (argv) {
        return Boolean(argv.server.match(/.:\d+$/))
    })
    .argv
;

var DNode = require('dnode');
var Hash = require('traverse/hash');
var Store = require('supermarket');

var IRC = require('irc-js');
var Bot = require('rowbit/bot');

var Seq = require('seq');
Seq()
    .seq('db', function () {
        Store({ filename : __dirname + '/rowbit.db', json : true }, this);
    })
    .par(function (db) { db.get('channels', this) })
    .par(function (db) { db.get('password', this) })
    .seq(function (ch, pw) {
        var channels = (ch || []).concat((argv.channels || '').split(','));
        console.dir(channels);
        var irc = new IRC({
            server : argv.server.split(/:/)[0],
            port : argv.server.split(/:/)[1],
            nick : argv.nick,
            channels : channels,
            encoding : 'utf8',
        })
        irc.connect((function () {
            DNode(function (remote, conn) {
                return irc;
            }).on('localError', this).listen(5050);
        }).bind(this));
    })
;
