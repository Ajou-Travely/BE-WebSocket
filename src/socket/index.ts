import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

import { TYPE } from "@type/index";

interface RoomType {
  [key: number]: any;
}

let roomList: RoomType = {};

const popUser = (_id: any, uuid: string) =>
  roomList[_id].filter((element: any) => element !== uuid);

const getSocket = (
  socketIO: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socketIO.on("connection", (socket) => {
    console.log("WebSocket Connected");

    socket.on(TYPE.CREATE_ROOM, (_id, done) => {
      //방 Object 생성
      roomList[_id] = [];
      done({ status: "SUCESS", message: "성공적으로 방을 만들었습니다." });
    });

    socket.on(TYPE.JOIN_ROOM, (_id, uuid, done) => {
      if (!(_id in roomList))
        done({ status: "FAILED", message: "방이 존재하지 않습니다." });
      roomList[_id].push(uuid);
      socket.join(_id);
      done({ status: "SUCESS", message: "성공적으로 방에 들어왔습니다." });
    });

    socket.on(TYPE.LEAVE_ROOM, (_id, uuid, done) => {
      if (roomList[uuid]) {
        socket.leave(uuid);
        roomList[_id] = popUser(_id, uuid);
        done({ status: "SUCESS", message: "성공적으로 방을 떠났습니다." });
      } else {
        done({ status: "FAILED", message: "오류가 있습니다." });
      }
    });

    socket.on(TYPE.MOUSE_MOVE, (_id, uuid, { x, y }) => {
      socketIO.to(_id).emit(TYPE.MOUSE_MOVE, { uuid, position: { x, y } });
    });

    socket.on(TYPE.ADD_SCHEDULE, () => {});

    socket.on(TYPE.REMOVE_SCHEDULE, () => {});

    socket.on(TYPE.UPDATE_SCHEDULE, () => {});
  });
};

export { getSocket };
