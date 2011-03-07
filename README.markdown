rowbit
======

An IRC robot? How absurd!

This one uses DNode for its plugin system, so modules are just processes that
connect to the rowbit server.

You can write quick little one-off dispatchers too, which is useful for
notification servers.

usage
=====

    npm link
    rowbit server irc.freenode.net:6667
    rowbit say \#stackvm beep boop
