import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

import { TYPE } from "@type/index";
import { Coordinate, Mark, User } from "@src/objects/user";
import { Queue } from "queue-typescript";

interface RoomType {
  [key: string]: any;
}

const createRoom = (travelId: number, userId: number, socketId: string) => {
  const code: number = travelId;
  const rgb = Math.random().toString(16).substr(2, 7);
  if (roomList[code] === undefined) {
    roomList[code] = {};
    roomList[code][socketId] = new User(userId, { x: 0, y: 0 } ,{ x: 0, y: 0}, rgb, new Queue<Mark>());
  }
}
// const defaultCode = "capstone";

let roomList: RoomType = {};

// const createRoomCode = () => {
//   while (true) {
//     const code = Math.random().toString(16).substr(2, 5); 
//     if (!(code in Object.keys(roomList))) return code;
//   }
// };



const popUser = (code: any, uuid: string) =>
  // roomList[code].filter((element: any) => element !== uuid);
  delete roomList[code][uuid];

const checkEmptyRoom = (code: string) =>
  // roomList[code].length === 0 && delete roomList[code];
  Object.keys(roomList[code]).length === 0 && delete roomList[code];

const getSocket = (
  socketIO: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socketIO.on("connect", (socket) => {
    console.log("WebSocket Connected");

    socket.on(TYPE.CREATE_ROOM, (travelId, userId, done) => {
      //방 Object 생성
      createRoom(travelId, userId, socket.id);
      socket.join(travelId);
      done({
        status: "SUCESS",
        message: "성공적으로 방을 만들었습니다.",
        travelId,
      });
    });

    socket.on(TYPE.JOIN_ROOM, (travelId, userId, done) => {
      console.log(roomList);
      if (!(travelId in roomList)) {
        createRoom(travelId, userId, socket.id);
        socket.join(travelId);
        done({ 
          status: "SUCCESS", 
          message: "방이 존재하지 않아 생성했습니다." 
        });
      }
      else {
        try {
          const rgb = "#" + Math.random().toString(16).substr(2, 6);
          roomList[travelId][socket.id] = new User(userId, { x: 0, y: 0 }, { x: 0, y: 0 }, rgb, new Queue<Mark>());
          socket.join(travelId);
          done({ 
            status: "SUCCESS", 
            message: "성공적으로 방에 들어왔습니다." 
          });
        } catch (e) {
          done({ 
            status: "FAILED", 
            message: e 
          });
        }
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

    socket.on(TYPE.MOUSE_MOVE, (travelId, { focus, coordinate }) => {
      if (
        roomList[travelId] === undefined ||
        roomList[travelId][socket.id] === undefined
      ) return;
      // roomList[travelId][socket.id] = { x, y, rgb: roomList[travelId][socket.id].rgb };
      roomList[travelId][socket.id].focus = focus;
      roomList[travelId][socket.id].focus = coordinate;
      socketIO.to(travelId).emit("CLIENT_MOVE", roomList[travelId]);
    });

    socket.on(TYPE.PIN_MARK, (travelId, focus: Coordinate, coordinate: Coordinate) => {
      if (
        roomList[travelId] === undefined ||
        roomList[travelId][socket.id] === undefined
      ) return;
      const mark: Mark = { focus, coordinate };
      roomList[travelId][socket.id].marks.enqueue(mark);
      socketIO.to(travelId).emit("CLIENT_PIN_MARK", roomList[travelId][socket.id]);
      setTimeout(() => {
        if (roomList[travelId][socket.id].marks.length === 0) {
          return;
        } else {
          roomList[travelId][socket.id].marks.dequeue();
          socketIO.to(travelId).emit("CLIENT_DELETE_MARK", roomList[travelId][socket.id]);
        }
      }, 2000);
    });

    // socket.on(TYPE.DELETE_MARK, (travelId) => {
    //   if (
    //     roomList[travelId] === undefined ||
    //     roomList[travelId][socket.id] === undefined
    //   ) return;
    //   roomList[travelId][socket.id].marks.dequeue();
    //   socketIO.to(travelId).emit("CLIENT_PIN_MARK", roomList[travelId][socket.id]);
    // });

    // socket.on(TYPE.ADD_SCHEDULE, () => {});

    // socket.on(TYPE.REMOVE_SCHEDULE, () => {});

    socket.on(TYPE.UPDATE_SCHEDULE, (travelId, schedulesOrder: number[]) => {
      socketIO.to(travelId).emit("CLIENT_UPDATE_SCHEDULE", schedulesOrder);
    });

    socket.on(TYPE.DISCONNECT, (travelId, done) => {
      if (roomList[travelId]) {
        socket.leave(travelId);
        roomList[travelId] = popUser(travelId, socket.id);
        if(checkEmptyRoom(travelId)) {
          done({
            message: `${travelId}방의 사용자가 모두 나가 방이 소멸되었습니다.`
          })
        } else {
          const message = `${socket.id} 님이 방을 나갔습니다.`
          socketIO.to(travelId).emit(TYPE.DISCONNECT, message);
          done({
            message: message
          });
        }
      }
    });

    // socket.on(TYPE.DISCONNECT, (code, done) => {
    //   if (roomList[socket.id]) {
    //     socket.leave(socket.id);
    //     // roomList[code] = popUser(code, socket.id);
    //     // done({ status: "SUCESS", message: "성공적으로 방을 떠났습니다." });
    //   } else {
    //     // done({ status: "FAILED", message: "오류가 있습니다." });
    //   }
    // });
  });
};

export { getSocket };
