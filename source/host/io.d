module host.io;
import std.stdio;
import std.file;
import std.string;
import defs;

public string[] readDirectory(string directory)
{
    auto files = dirEntries(directory, SpanMode.depth);
    string[] list;
    foreach(d; files)
    {
        if (d.isFile)
            list ~= ("" ~ d.name.replace(baseDirectory, ""));
    }
    return list;
}

public string readFile(string filePath)
{
    return readText(filePath);
}

public void writeFile(string filePath, string fileData)
{
    std.file.write(filePath, fileData);
}