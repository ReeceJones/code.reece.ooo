import std.stdio;
import vibe.d;
import host.socket;

shared static this()
{
    auto router = new URLRouter;
    router.get("/", staticTemplate!("index.dt"));
    router.get("/host", handleWebSockets(&handleIOCommunication));

    
    router.get("*", serveStaticFiles("public/"));

    auto settings = new HTTPServerSettings;
    settings.port = 9003; // change to remove conflicts
    settings.bindAddresses = ["::1", "0.0.0.0"];
    settings.sessionStore = new MemorySessionStore;
    listenHTTP(settings, router);
}