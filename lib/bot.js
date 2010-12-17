var DNode = require('dnode');
var Store = require('supermarket');

module.exports = function (cb) {
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
                .connect('nexus.browserling.com', 5050, this.bind(this, null))
                .on('localError', this)
            ;
        })
        .seq(function (secret, remote) {
            this.vars.remote = remote;
            this.vars.conn = this.args[1][1];
            remote.auth(secret, this);
        })
        .seq(function (bot) {
            cb(bot, this.vars);
        })
    ;
}
