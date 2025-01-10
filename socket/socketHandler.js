import chatstoreController from "../controllers/chatstore.controller.js";
import UserService from "../services/UserService.js";

class SocketHandler {
  constructor(){
  
  this.userSocketMap = new Map();
  }
  
  handleSocketEvents = (io) => {
    io.on("connection", (socket) => {
    const {socketId,loggedInuserId}=socket.handshake.query;
      console.log("User connected:", socket.id,loggedInuserId);
      if (!loggedInuserId || !socketId) {
        console.error("Connection attempt missing loggedInuserId or clientSocketId");
        socket.disconnect();
        return;
      }
      const existingSocketId = this.userSocketMap.get(loggedInuserId);
      if (existingSocketId && existingSocketId !== socketId) {
        console.warn(`Socket ID mismatch for user ${loggedInuserId}. Disconnecting old socket.`);
        io.sockets.sockets.get(existingSocketId)?.disconnect(); // Disconnect the old socket
      }
      this.userSocketMap.set(loggedInuserId, socket.id);
      console.log(`User connected: ${loggedInuserId} with socket ID: ${socket.id}`);
      
        
      socket.on("sendMessage", async (data) => {
        try {
        const {groupId,userId,message}=data;
        const groupRoom = `group_${groupId}`;
        const usersDetails = await UserService.getUserById(userId);
        const username = await usersDetails.toJSON();
        console.log(username);
        const savedMessage = {
        text : message,
        user_id:userId,
        sender : username.name,
        timestamp:new Date(),
        };
           await chatstoreController.storechat({groupId,userId,message});
          
          io.emit("newMessage", savedMessage);
        } catch (error) {
          console.error("Socket Error:", error);
          socket.emit("errorMessage", { error: "Failed to send message." });
        }
      });
      socket.emit("socketIdUpdated", { socketId: socket.id });
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${loggedInuserId} with socket ID: ${socket.id}`);
        // Find the user associated with this socket and remove the mapping
        for (const [userId, mappedSocketId] of this.userSocketMap.entries()) {
          if (mappedSocketId === socket.id) {
            this.userSocketMap.delete(userId);
            console.log(`Mapping removed for user: ${userId}`);
            break;
          }
        }
      });
    });
  };
  getSocketIdByUserId(userId){
    return this.userSocketMap.get(userId) || null;
  }
}

export default new SocketHandler();
