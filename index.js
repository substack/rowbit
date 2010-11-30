var fs = require('fs');
var spawn = require('child_process').spawn;

var args = process.argv.slice(2);

var cmd = args.shift();
var scripts = fs.readdirSync(__dirname + '/bin');

if (scripts.indexOf(cmd + '.js') < 0) {
    console.error('No such command. Available commands:');
    console.error('    ' + scripts.join(' '));
}
else {
    args.unshift(__dirname + '/bin/' + cmd + '.js');
    var bin = spawn(process.argv[0], args);
    bin.stdout.on('data', function (buf) { console.log(buf.toString()) });
    bin.stderr.on('data', function (buf) { console.error(buf.toString()) });
}
