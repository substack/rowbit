var dnode = require('dnode');
var fs = require('fs');
var config = JSON.parse(
    fs.readFileSync(__dirname + '/../rowbit.json', 'utf8')
);

module.exports = function (cb) {
    dnode.connect(config.server, function (remote, conn) {
        remote.auth(config.secret, function (err, bot) {
            cb(bot, { remote : remote, conn : conn })
        })
    });
};
