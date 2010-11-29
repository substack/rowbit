var DNode = require('dnode');
var Store = require('supermarket');

var channel = process.argv[2];
var msg = process.argv.slice(3).join(' ');

var Seq = require('seq');
Seq()
    .seq('db', function () {
        Store({ filename : __dirname + '/../rowbit.db', json : true }, this);
    })
    .par(function (db) {
        db.get('secret', this);
    })
    .par(function (secret) {
        DNode
            .connect(5050, this.bind(this, null))
            .on('localError', this)
        ;
    })
    .seq(function (secret, remote) {
        this.vars.conn = this.args[1][1];
        remote.auth(secret, this);
    })
    .seq(function (bot) {
        bot.irc.privmsg(channel, msg);
        this.vars.conn.end();
    })
;
