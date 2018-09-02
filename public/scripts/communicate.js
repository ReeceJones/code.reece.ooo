/*
var socket; // websocket connection

function getBaseURL() {
    var href = window.location.href.substring(7); // strip "http://"
    var idx = href.indexOf("/");
    return "ws://" + href.substring(0, idx);
}

function updateFileList() {
    $("#-files-").html("<br>");
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
    $("#-files-" + id.substring(0, id.lastIndexOf("-")+1)).append("<div class=\"file\" id=\"" + id + "\">" + "<div class=\"pad file\" id=\"" + id + "\">" + tok[tok.length - 1] + "</div></div>");


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
    $("#-files-").click(function(e) {
        // ignore accidental clicks on the background
        if (e.target.id.toString() != "-files-") {
            let location = e.target.id.toString().replace(new RegExp("-", "g"), "/");
            if (location[location.length-1] == "/") { // its a directory
                console.log(location + " is a directory...collapsing");
                let value = $("#" + e.target.id.toString()).children("div :not(#" + e.target.id.toString() + ")").css("display");
                if (value == "none") {
                    $("#" + e.target.id.toString()).children("div :not(#" + e.target.id.toString() + ")").css("display", "inline");
                    $("b#" + e.target.id.toString()).html("- " + $("b#" + e.target.id.toString()).html().toString().substring(1));
                }
                else {
                    $("#" + e.target.id.toString()).children("div :not(#" + e.target.id.toString() + ")").css("display", "none");
                    $("b#" + e.target.id.toString()).html("+ " + $("b#" + e.target.id.toString()).html().toString().substring(1));
                }
            }
            else { // its a file
                console.log(e.target.id);
                let j = new Object();
                j.operation = "fileop-read";
                j.file = location;
                console.log("clicked: " + e.target.id.toString());
                let str = JSON.stringify(j);
                socket.send(str);
            }
        }
    });
});

// create the editor
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

function connect() {
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
                console.log(json.data[0]);
                let directories = [];
                for (let i = 0; i < json.elements; i++)
                {
                    // $("#files").append("<br>" + json.data[i]);

                    // before adding the file, we need  to make sure that the file directory structure exists in the editor
                    let tok = json.data[0][i].split("/");
                    console.log(tok);
                    let divDirectory = "";
                    let prev = divDirectory;
                    for (let j = 0; j < tok.length - 1; j++) {
                        divDirectory += tok[j] + "-";
                        if (!$("#-files-" + divDirectory).length) {
                            $("#-files-" + prev).append("<div class=\"pad\" id=\"-files-" + divDirectory + 
                            "\"><div id=\"-files-" + divDirectory + "\"><b id=\"-files-" + divDirectory + 
                            "\" class=\"folder\">- " + tok[j] + "</b></div>");
                        }
                        prev = divDirectory;
                    }
                    directories.push(divDirectory);
                    // tinysort('div#-files-' + divDirectory + '>div',{attr:'id'});
                    addFile(json.data[0][i]);
                }
                console.log(directories);
                for (let i = 0; i < directories.length; i++) {
                    tinysort('div#-files-' + directories[i] + '>div', {attr: 'id'});
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
        connect();
        // $("#files").html("[error] socket closed");
        // connect();
    }
}

connect();
*/

class HashMemory {
    constructor(data) {
        this.data = data;
    }
    type(hash) {
        for (let i = 0; i < this.data.folders.length; i++) {
            if (this.data.folders[i].hash == hash) {
                return "folder";
            }
        }
        for (let i = 0; i < this.data.files.length; i++) {
            if (this.data.files[i].hash == hash) {
                return "file";
            }
        }
        return "unknown";
    }
    toPath(hash) {
        for (let i = 0; i < this.data.folders.length; i++) {
            if (this.data.folders[i].hash == hash) {
                return this.data.folders[i].path;
            }
        }
        for (let i = 0; i < this.data.files.length; i++) {
            if (this.data.files[i].hash == hash) {
                return this.data.files[i].path;
            }
        }
        return "unknown";
    }
}

var websocket;
var hashMemory;

function findHash(data, path) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].path == path)
            return data[i].hash;
    }
    return "";
}

function serverRequest(fn) {
    websocket = new WebSocket("ws://code.reece.ooo/host");
    websocket.onopen = function() {
        console.log("websocket connected to server");
        fn();
    }
    websocket.onmessage = function(message) {
        let json = JSON.parse(message.data);
        switch (json.operation) {
            default:
                console.log("unknown operation: " + json.operation);
            break;
            case "filelist-update":
                let data = JSON.parse(json.data);
                console.log(data.files);
                console.log(data.folders);
                hashMemory = new HashMemory(data);
                for (let i = 0; i < data.folders.length; i++) {
                    if  (data.folders[i] != "") {
                        let tok = data.folders[i].path.split("/");
                        let confident = data.folders[i].path.substring(0, data.folders[i].path.lastIndexOf("/"));
                        // console.log("real: " + data.folders[i].path + " confident: " + confident);
                        let parent = tok.length == 1 ? "file-container" 
                                    : findHash(data.folders, confident);//data.folders[i-1].hash;
                        $("#" + parent).append("<div class=\"pad\" id=\"" + data.folders[i].hash +
                                        "\"><div class=\"folder\" id=\"" + data.folders[i].hash + "\"><b id=\"" + data.folders[i].hash + "\">- " + tok[tok.length-1] + "</b></div></div>");
                    }
                }
                // after doing folders we can add files
                for (let i = 0; i < data.files.length; i++) {
                    if (data.files[i] != "") {
                        let folder = data.files[i].path.substring(0, data.files[i].path.lastIndexOf("/"));
                        let hash = findHash(data.folders, folder);
                        let tok = data.files[i].path.split("/");
                        $("#" + hash).append(
                            "<div class=\"file pad\" id=\"" + data.files[i].hash + "\">" + tok[tok.length-1] + "</div>" 
                        );
                    }
                }
            break;
            case "fileop-read":
                editor.setValue(json.data);
            break;
        }
        websocket.close();
    }
    websocket.onclose = function(event) {
        console.log("socket closed: " + event.code);
    }
}



// create editor on page load
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

serverRequest(function() {
    $("#file-container").html("<br>");
    let j = new Object();
    j.operation = "filelist-update";
    let str = JSON.stringify(j);
    websocket.send(str);
});

$(function() {
    $("#file-container").click(function(e) {
        console.log("clicked: " + e.target.id);
        let type = hashMemory.type(e.target.id);
        switch (type) {
            default: console.log("unknown type"); break;
            case "folder":
                let value = $("#" + e.target.id.toString()).children("div :not(#" + e.target.id.toString() + ")").css("display");
                if (value == "none") {
                    $("#" + e.target.id.toString()).children("div :not(#" + e.target.id.toString() + ")").css("display", "inline");
                    $("b[id='" + e.target.id.toString() + "']").html("- " + $("b[id='" + e.target.id.toString() + "']").html().toString().substring(1));
                }
                else {
                    $("#" + e.target.id.toString()).children("div :not(#" + e.target.id.toString() + ")").css("display", "none");
                    $("b[id='" + e.target.id.toString() + "']").html("+ " + $("b[id='" + e.target.id.toString() + "']").html().toString().substring(1));
                }
            break;
            case "file":
                serverRequest(function() {
                    let j = new Object();
                    j.operation = "fileop-read";
                    j.file = hashMemory.toPath(e.target.id);
                    let str = JSON.stringify(j);
                    websocket.send(str);
                });
            break;
        }
    });
});