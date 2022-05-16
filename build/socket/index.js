"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocket = void 0;
const index_1 = require("@type/index");
let roomList = {};
const createRoomCode = () => {
    while (true) {
        const code = Math.random().toString(16).substr(2, 5);
        if (!(code in Object.keys(roomList)))
            return code;
    }
};
const popUser = (code, uuid) => roomList[code].filter((element) => element !== uuid);
const checkEmptyRoom = (code) => roomList[code].length === 0 && delete roomList[code];
const getSocket = (socketIO) => {
    socketIO.on("connect", (socket) => {
        console.log("WebSocket Connected");
        socket.on(index_1.TYPE.CREATE_ROOM, (done) => {
            //방 Object 생성
            const code = createRoomCode();
            roomList[code] = [];
            done({
                status: "SUCESS",
                message: "성공적으로 방을 만들었습니다.",
                code,
            });
        });
        socket.on(index_1.TYPE.JOIN_ROOM, (code, done) => {
            console.log(roomList);
            if (!(code in roomList))
                done({ status: "FAILED", message: "방이 존재하지 않습니다." });
            try {
                roomList[code].push(socket.id);
                socket.join(code);
                done({ status: "SUCESS", message: "성공적으로 방에 들어왔습니다." });
            }
            catch (e) {
                done({ status: "FAILED", message: e });
            }
        });
        socket.on(index_1.TYPE.LEAVE_ROOM, (code, done) => {
            if (roomList[code]) {
                socket.leave(code);
                roomList[code] = popUser(code, socket.id);
                checkEmptyRoom(code);
                done({ status: "SUCESS", message: "성공적으로 방을 떠났습니다." });
            }
            else {
                done({ status: "FAILED", message: "오류가 있습니다." });
            }
        });
        socket.on(index_1.TYPE.MOUSE_MOVE, (code, { x, y }) => {
            socketIO
                .to(code)
                .emit(index_1.TYPE.MOUSE_MOVE, { id: socket.id, position: { x, y } });
        });
        socket.on(index_1.TYPE.ADD_SCHEDULE, () => { });
        socket.on(index_1.TYPE.REMOVE_SCHEDULE, () => { });
        socket.on(index_1.TYPE.UPDATE_SCHEDULE, () => { });
        socket.on(index_1.TYPE.DISCONNECT, (code, done) => {
            if (roomList[socket.id]) {
                socket.leave(socket.id);
                roomList[code] = popUser(code, socket.id);
                // done({ status: "SUCESS", message: "성공적으로 방을 떠났습니다." });
            }
            else {
                // done({ status: "FAILED", message: "오류가 있습니다." });
            }
        });
    });
};
exports.getSocket = getSocket;
//# sourceMappingURL=index.js.map