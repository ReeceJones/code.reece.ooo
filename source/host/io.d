module host.io;
import std.stdio;
import std.file;
import std.string;
import std.digest.crc;
import std.json;
import defs;

/**
    Reads all contents in a directory recursively.

    Returns a json string of the path hash and the file path.
*/
public string readDirectory(string directory)
{
    auto files = dirEntries(directory, SpanMode.breadth);
    JSONValue list;
    list["files"] = JSONValue([""]);
    list["folders"] = JSONValue([""]);
    foreach(d; files)
    {
        JSONValue json;
        if (d.isFile)
        {
            string path = ("" ~ d.name.replace(baseDirectory, ""));
            json["path"] = JSONValue(path);
            json["hash"] = JSONValue(crcHexString(crc32Of(path)));
            try {
                list["files"].array ~= json;
            } catch (JSONException ex) {
                writeln("failed to write file array");
            }
        }
        else if (d.isDir)
        {
            string path = ("" ~ d.name.replace(baseDirectory, ""));
            json["path"] = JSONValue(path);
            json["hash"] = JSONValue(crcHexString(crc32Of(path)));
            try {
                list["folders"].array ~= json;
            } catch (JSONException ex) {
                writeln("failed to write folder array");
            }
        }
    }
    writeln(list.toPrettyString());
    return list.toString();
}

public string readFile(string filePath)
{
    return readText(filePath);
}

public void writeFile(string filePath, string fileData)
{
    std.file.write(filePath, fileData);
}

public bool moveFile(string targetPath, string targetFile)
{
    if (!targetFile.exists)
        return false;
    string newPath = targetPath ~ targetFile[targetFile.lastIndexOf("/")+1..$];
    if (newPath.exists)
        return false;
    File* newFile = new File(newPath, "w");
    File* target = new File(targetFile, "r");
    foreach(buffer; target.byChunk(4096))
    {
        newFile.write(buffer);
    }
    newFile.close();
    target.close();
    // now remove the old file
    //target.remove();
    targetFile.remove();
    return true;
}