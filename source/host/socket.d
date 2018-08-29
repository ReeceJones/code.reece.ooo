module host.socket;

import vibe.http.websockets;
import std.json;
import vibe.http.websockets;
import std.stdio;
import std.string;
import host.io;

immutable string baseDirectory = "/etc/vibe/code.reece.ooo/public/userdata/";

public void handleIOCommunication(scope WebSocket socket)
{
    // we want to use a loop, because we want to be able to save, read, run, etc. all on the same socket if possible
    do
    {
        auto io = socket.receiveText();
        auto json = io.parseJSON;
        string operation = json["operation"].str.strip;

        JSONValue response;
        if (operation == "filelist-update")
        {
            string[] files = readDirectory(baseDirectory);
            response["elements"] = JSONValue(files.length);
            response["data"] = JSONValue(files);
            writeln("filelist-update json data:\n", response.toPrettyString());
        }
        else if (operation == "fileop-read")
        {
            string fileData = readFile(baseDirectory ~ json["file"].str);
            response["data"] = fileData;
            writeln("fileop-read json data:\n", response.toPrettyString);
        }
        socket.send(response.toString);

    } while(socket.connected);
}
