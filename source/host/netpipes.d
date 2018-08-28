module host.netpipes;

import std.stdio;

public class NetPipe
{
public:
    this(File pipe)
    {
        _pipe = pipe;
    }
private:
    File _pipe;
}