var args = process.argv.slice(2);
var spawn = require('child_process').spawn;

var cmd = args.shift();
if (cmd == 'server') {
    args.unshift(__dirname + '/bin/server.js');
    var bin = spawn(process.argv[0], args);
    bin.stdout.on('data', function (buf) { console.log(buf.toString()) });
    bin.stderr.on('data', function (buf) { console.error(buf.toString()) });
}
else if (cmd == 'say') {
    args.unshift(__dirname + '/bin/say.js');
    var bin = spawn(process.argv[0], args);
    bin.stdout.on('data', function (buf) { console.log(buf.toString()) });
    bin.stderr.on('data', function (buf) { console.error(buf.toString()) });
}
else {
    console.log('Commands: server, say');
}
