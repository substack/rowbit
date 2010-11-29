var argv = require('optimist').argv;
var spawn = require('child_process').spawn;

var cmd = argv._.shift();
if (cmd == 'server') {
    argv._.unshift(__dirname + '/bin/server.js');
    var bin = spawn(process.argv[0], argv._);
    bin.stdout.on('data', console.log);
    bin.stderr.on('data', console.error);
}
else if (cmd == 'say') {
    var ch = argv._[1];
    argv._.unshift(__dirname + '/bin/say.js');
    var bin = spawn(process.argv[0], argv._);
    bin.stdout.on('data', console.log);
    bin.stderr.on('data', console.error);
}
else {
    console.log('Commands: server, say');
}
