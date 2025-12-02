import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { ChatService } from "../../application/services";
import { logger } from "../../shared/logger";

export let io: Server;

export const configureSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`⚡ Socket Conectado: ${socket.id}`);

    socket.on('join_room', (orderId) => {
      socket.join(`order_${orderId}`);
      logger.info(`Socket ${socket.id} entrou na sala order_${orderId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        // Salva no banco usando o Service
        const savedMsg = await ChatService.sendMessage({
           request_id: data.request_id,
           sender_id: data.sender_id,
           content: data.content
        });
        
        // Emite para a sala
        io.to(`order_${data.request_id}`).emit('receive_message', savedMsg);
      } catch (error) {
        logger.error("Erro no socket send_message", error);
      }
    });
  });
};