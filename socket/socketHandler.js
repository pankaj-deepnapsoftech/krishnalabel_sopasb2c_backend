module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log("New client connected:", socket.id);
      socket.on("notificationdatachange", async (data) => {
        try {
          // Simulate commit save
          io.emit("changesapply", true);
        } catch (error) {
          console.error("Error saving data:", error.message);
          io.emit("changesapply", "Failed to save data");
        }
      });
  
      socket.on('disconnect', () => {
        console.log(`Client disconnected : ${socket.id}`);
      });

    });
  };
  