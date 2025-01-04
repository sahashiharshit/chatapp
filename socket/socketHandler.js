import chatstoreController from "../controllers/chatstore.controller.js";

class SocketHandler {
  handleSocketEvents = (io) => {
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("sendMessage", async (data) => {
        try {
          const savedMessage = await chatstoreController.storechat(data);
          io.to(`group_${data.groupId}`).emit("newMessage", savedMessage);
        } catch (error) {
          console.error("Socket Error:", error);
          socket.emit("errorMessage", { error: "Failed to send message." });
        }
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  };
}

export default new SocketHandler();
