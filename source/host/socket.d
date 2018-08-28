module host.socket;

import vibe.http.websockets;
import std.json;
import std.file;
import std.bitmanip;
import vibe.http.websockets;
import std.stdio;

string baseDirectory = "/etc/vibe/code.reece.ooo/public/userdata/";

public void handleIOCommunication(scope WebSocket socket)
{
    // we want to use a loop, because we want to be able to save, read, run, etc. all on the same socket if possible
    do
    {
        auto io = socket.receiveText();
        auto json = io.parseJSON;
        string operation = json["operation"].str;

        JSONValue response;
        if (operation == "filelist-update")
        {
            string[] files = updateFiles();
            response["elements"] = JSONValue(files.length);
            response["data"] = JSONValue(files);
            writeln("filelist-update json data:\n", response.toPrettyString());
        }
        else if (operation == "fileop-read")
        {
            string fileData = readText(baseDirectory ~ json["file"].str);
            response["data"] = fileData;
            writeln("fileop-read json data:\n", response.toPrettyString);
        }
        socket.send(response.toString);

    } while(socket.connected);
}

string[] updateFiles()
{
    auto files = dirEntries(baseDirectory, SpanMode.depth);
    string[] list;
    foreach(d; files)
    {
        writeln(d.isDir ? "dir" : "file",":\t\t", d.name);
        if (d.isDir || d.isFile) // ignore symlinks
            list ~= (d.isDir ? "[dir]" : "[file]" ~ d.name);
    }
    return list;
}
