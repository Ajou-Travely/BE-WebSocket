"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocket = void 0;
const index_1 = require("@type/index");
const redis = require('redis');
const redis_client = redis.create(6379);
let roomList = {};
const popUser = (_id, uuid) => roomList[_id].filter((element) => element !== uuid);
const getSocket = (socketIO) => {
    socketIO.on("connection", (socket) => {
        console.log("WebSocket Connected");
        socket.on(index_1.TYPE.CREATE_ROOM, (_id, done) => {
            //방 Object 생성
            roomList[_id] = [];
            done({ status: "SUCESS", message: "성공적으로 방을 만들었습니다." });
        });
        socket.on(index_1.TYPE.JOIN_ROOM, (_id, uuid, done) => {
            if (!(_id in roomList))
                done({ status: "FAILED", message: "방이 존재하지 않습니다." });
            roomList[_id].push(uuid);
            socket.join(_id);
            done({ status: "SUCESS", message: "성공적으로 방에 들어왔습니다." });
        });
        socket.on(index_1.TYPE.LEAVE_ROOM, (_id, uuid, done) => {
            if (roomList[uuid]) {
                socket.leave(uuid);
                roomList[_id] = popUser(_id, uuid);
                done({ status: "SUCESS", message: "성공적으로 방을 떠났습니다." });
            }
            else {
                done({ status: "FAILED", message: "오류가 있습니다." });
            }
        });
        socket.on(index_1.TYPE.MOUSE_MOVE, (_id, uuid, { x, y }) => {
            socketIO.to(_id).emit(index_1.TYPE.MOUSE_MOVE, { uuid, position: { x, y } });
        });
        socket.on(index_1.TYPE.ADD_SCHEDULE, () => { });
        socket.on(index_1.TYPE.REMOVE_SCHEDULE, () => { });
        socket.on(index_1.TYPE.UPDATE_SCHEDULE, () => { });
    });
};
exports.getSocket = getSocket;
//# sourceMappingURL=index.js.map