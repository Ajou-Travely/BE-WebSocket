import { createServer } from "http";
import { Server } from "socket.io";

import { getSocket } from "@socket/index";
const httpServer: any = createServer();
const io: Server = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
getSocket(io);
httpServer.listen(4000, () => {
  console.log("Server On");
});
