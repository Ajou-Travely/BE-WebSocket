import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer: any = createServer();
const io: Server = new Server(httpServer, {
    cors: {
      origin: '*',
    }
});

io.on('connection', (socket) => {
  console.log('WebSocket Connected');
  // 수신한 event에 대한 처리를 해주면 됩니다. 아래는 예시
  socket.on('join', (params) => {
      console.log(params.clientId, '가', params.roomNumber, '번 방에 입장합니다.');
  });
  socket.on('message', (params) => {
      console.log(params.message);
  });
})

httpServer.listen(4000, () => {
  console.log('Server On');
});