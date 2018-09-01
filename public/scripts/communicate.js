var socket; // websocket connection

function getBaseURL() {
    var href = window.location.href.substring(7); // strip "http://"
    var idx = href.indexOf("/");
    return "ws://" + href.substring(0, idx);
}

function updateFileList() {
    $("#files-").html("");
    let j = new Object();
    j.operation = "filelist-update";
    let str = JSON.stringify(j);
    socket.send(str);
}

function addFile(path) {
    let str = path.toString();
    // $("#files").append("<div class=\"file\" id=\"" + path + "\"><div class=\"pad\">" + str + "</div></div>");
    // the folders will be [0..$-1]
    let tok = str.split("/");
    let depth = tok.length;
    // make sure that the folder(s) we display to in the list exist
    let id = path.replace(new RegExp("/", "g"), "-");
    console.log(id.substring(0, id.lastIndexOf("-")));
    $("#files-" + id.substring(0, id.lastIndexOf("-")+1)).append("<div class=\"file\" id=\"" + id + "\">" + "<div class=\"pad\" id=\"" + id + "\">" + tok[tok.length - 1] + "</div></div>");


    // let html = "<div class=\"file\" id=\"" + path + "\">";
    // let close = "</div>";
    // for (let i = 0; i < depth + 1; i++)
    // {
    //     html += "<div class=\"pad\" id=\"" + path +  "\">";
    //     close += "</div>";
    // }
    // html += str + close;
    // $("#files").append(html);
}

function readFile(file) {
    socket = new WebSocket(getBaseURL + "/host");
    socket.onopen = function() {
        socket.send(file);
    }
}

$(function() {
    $("#files-").click(function(e) {
        // ignore accidental clicks on the background
        if (e.target.id.toString() != "files-") {
            let location = e.target.id.toString().replace(new RegExp("-", "g"), "/");
            if (location[location.length-1] == "/") { // its a directory
                console.log(location + " is a directory...collapsing");
            }
            else { // its a file
                console.log(e.target.id);
                let j = new Object();
                j.operation = "fileop-read";
                j.file = location;
                console.log("clicked: " + j);
                let str = JSON.stringify(j);
                socket.send(str);
            }
        }
    });
});

var editor = ace.edit("editor");
editor.setTheme("ace/theme/ambiance");
editor.session.setMode("ace/mode/c_cpp");
editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    highlightActiveLine: true,
    highlightSelectedWord: true,
    readOnly: false,
    cursorStyle: "slim",
    mergeUndoDeltas: true,
    behavioursEnabled: true,
    showPrintMargin: false,
    showFoldWidgets: true,
    showLineNumbers: true,
    showGutter: true,
    displayIndentGuides: true,
    scrollPastEnd: 1,
    enableSnippets: true,
    showInvisibles: true,
    highlightActiveLine: true
});

// script loadtime
console.log("connecting to server...");
socket = new WebSocket(getBaseURL() + "/host");
socket.onopen = function() {
    $("#files-").html("");
    console.log("connected to server.");
    updateFileList();
    // var jsonObj = new Object;
    // jsonObj.operation = "filelist-update";
    // console.log(JSON.stringify(jsonObj));
    // socket.send(JSON.stringify(jsonObj));
}
socket.onmessage = function(message) {
    let json = JSON.parse(message.data);
    switch (json.operation)
    {
        default: console.log("undefined operation: " + json.operation); break;
        case "filelist-update":
            let sorted = json.data[0].sort();
            for (let i = 0; i < json.elements; i++)
            {
                // $("#files").append("<br>" + json.data[i]);

                // before adding the file, we need  to make sure that the file directory structure exists in the editor
                let tok = json.data[0][i].split("/");
                let divDirectory = "";
                let prev = divDirectory;
                for (let j = 0; j < tok.length - 1; j++) {
                    divDirectory += tok[j] + "-";
                    if (!$("#files-" + divDirectory).length) {
                        $("#files-" + prev).append("<div class=\"pad\" id=\"files-" + divDirectory + 
                                            "\"><div id=\"files-" + divDirectory + "\">" + tok[j] + "</div></div>");
                    }
                    prev = divDirectory;
                }

                addFile(json.data[0][i]);
            }
        break;
        case "fileop-read":
            //TODO: ace.js document.setValue(json.data);
            editor.setValue(json.data);
        break;
    }
}
socket.onclose = function(event) {
    console.log("socket closed: " + event.code);
    // reconnect if we accidentally get disconnected
    socket = new WebSocket(getBaseURL() + "/host");
    // $("#files").html("[error] socket closed");
    // connect();
}