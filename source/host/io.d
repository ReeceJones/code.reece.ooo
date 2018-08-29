module host.io;
import std.stdio;
import std.file;

public string[] readDirectory(string directory)
{
    auto files = dirEntries(directory, SpanMode.depth);
    string[] list;
    foreach(d; files)
    {
        list ~= (d.isDir ? "[dir]" : "[file]" ~ d.name);
    }
    return list;
}

public string readFile(string filePath)
{
    return readText(filePath);
}

public string writeFile(string filePath, string fileData)
{
    std.file.write(filePath, fileData);
}