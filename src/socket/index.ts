import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

import { TYPE } from "@type/index";

interface RoomType {
  [key: string]: any;
}

const defaultCode = "capstone";

let roomList: RoomType = {};

const createRoomCode = () => {
  while (true) {
    const code = Math.random().toString(16).substr(2, 5);
    if (!(code in Object.keys(roomList))) return code;
  }
};

const rgb = Math.random().toString(16).substr(2, 7);

const popUser = (code: any, uuid: string) =>
  roomList[code].filter((element: any) => element !== uuid);

const checkEmptyRoom = (code: string) =>
  roomList[code].length === 0 && delete roomList[code];

const getSocket = (
  socketIO: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socketIO.on("connect", (socket) => {
    console.log("WebSocket Connected");

    socket.on(TYPE.CREATE_ROOM, (done) => {
      //방 Object 생성

      // const code = createRoomCode();
      const code = defaultCode;
      if (roomList[code] === undefined) roomList[code] = {};
      done({
        status: "SUCESS",
        message: "성공적으로 방을 만들었습니다.",
        code,
      });
    });

    socket.on(TYPE.JOIN_ROOM, (code, done) => {
      console.log(roomList);
      if (!(code in roomList))
        done({ status: "FAILED", message: "방이 존재하지 않습니다." });
      try {
        const rgb = "#" + Math.random().toString(16).substr(2, 6);
        roomList[code][socket.id] = { x: 0, y: 0, rgb };
        socket.join(code);
        done({ status: "SUCESS", message: "성공적으로 방에 들어왔습니다." });
      } catch (e) {
        done({ status: "FAILED", message: e });
      }
    });

    // socket.on(TYPE.LEAVE_ROOM, (code, done) => {
    //   if (roomList[code]) {
    //     socket.leave(code);
    //     roomList[code] = popUser(code, socket.id);
    //     checkEmptyRoom(code);
    //     done({ status: "SUCESS", message: "성공적으로 방을 떠났습니다." });
    //   } else {
    //     done({ status: "FAILED", message: "오류가 있습니다." });
    //   }
    // });

    socket.on(TYPE.MOUSE_MOVE, (code, { x, y, rgb }) => {
      if (
        roomList[code] === undefined ||
        roomList[code][socket.id] === undefined
      )
        return;
      roomList[code][socket.id] = { x, y, rgb: roomList[code][socket.id].rgb };
      socketIO.to(code).emit("CLIENT_MOVE", roomList[code]);
    });

    socket.on(TYPE.ADD_SCHEDULE, () => {});

    socket.on(TYPE.REMOVE_SCHEDULE, () => {});

    socket.on(TYPE.UPDATE_SCHEDULE, () => {});

    socket.on(TYPE.DISCONNECT, (code, done) => {
      if (roomList[socket.id]) {
        socket.leave(socket.id);
        // roomList[code] = popUser(code, socket.id);
        // done({ status: "SUCESS", message: "성공적으로 방을 떠났습니다." });
      } else {
        // done({ status: "FAILED", message: "오류가 있습니다." });
      }
    });
  });
};

export { getSocket };
