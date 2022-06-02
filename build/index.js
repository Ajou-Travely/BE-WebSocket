"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const index_1 = require("@socket/index");
const httpServer = (0, http_1.createServer)();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    },
});
(0, index_1.getSocket)(io);
httpServer.listen(4000, () => {
    console.log("Server On");
});
//# sourceMappingURL=index.js.map