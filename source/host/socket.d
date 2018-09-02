module host.socket;

import vibe.http.websockets;
import std.json;
import vibe.http.websockets;
import std.stdio;
import std.string;
import host.io;
import defs;

public void handleIOCommunication(scope WebSocket socket)
{
    // we want to use a loop, because we want to be able to save, read, run, etc. all on the same socket if possible
    do
    {
        auto io = socket.receiveText();
        auto json = io.parseJSON;
        string operation = json["operation"].str.strip;
        writeln("operation:", operation);

        JSONValue response;
        response["operation"] = JSONValue(operation);
        if (operation == "filelist-update")
        {
            string data = readDirectory(baseDirectory);
            response["data"] = JSONValue(data);

            writeln("filelist-update json data:\n", response.toPrettyString());
        }
        else if (operation == "fileop-read")
        {
            string fileData = readFile(baseDirectory ~ json["file"].str);
            try {
                response["data"] = JSONValue(fileData);
            } catch(JSONException ex) {writeln("file read failed");}
            writeln("fileop-read json data:\n", response.toPrettyString);
        }
        socket.send(response.toString);

    } while(socket.connected);
}
