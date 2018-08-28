module host.process;

import std.process;

class Process
{
public:
    this(string[] args)
    {
        _args = args;
    }
    void launch(Redirect redirect)
    {
        _pipes = pipeProcess(_args, redirect);
    }
    auto getPipeOut()
    {
        return _pipes.stdout;
    }
    auto getPipeIn()
    {
        return _pipes.stdin;
    }
    auto getPipeErr()
    {
        return _pipes.stderr;
    }
    auto getPid()
    {
        return _pipes.pid;
    }
    auto wait()
    {
        return std.process.wait(_pipes.pid);
    }
    auto tryWait()
    {
        return std.process.tryWait(_pipes.pid);
    }
    void kill()
    {
        std.process.kill(_pipes.pid);
    }
private:
    string[] _args;
    ProcessPipes _pipes;
}