const { Notification } = require("../models/notification");

class NotificationController {

  async getNotify(req, res) {
    const { _id } = req.user;
  
    try {
    
      const data = await Notification.find({ reciever_id: _id })
        .sort({ createdAt: -1 }) 
        .limit(5); 
  
      if (data.length === 0) {
        return res.status(404).json({ message: "No notifications found." });
      }
  
      return res.status(200).json({ data });
    } catch (error) {
      return res.status(500).json({
        message: "Something went wrong :(",
        error: error.message || error,
      });
    }
  }
  
  async updateNotify (req,res){

    try {
      const userId = req.user.id;
      const updatedNotifications = await Notification.updateMany(
        { receiver_id: userId, view: false },
        { $set: { view: true } }
      );
  
      if (updatedNotifications.modifiedCount === 0) {
        return res.status(200).json({
          message: 'No unread notifications found to mark as viewed',
        });
      }
  
      res.status(200).json({
        message: 'All notifications marked as viewed',
        data: updatedNotifications,
      });
    } catch (error) {     
      res.status(500).json({
        message: 'An error occurred while updating notifications',
        error: error.message,
      });
    }
   


  }
}

module.exports = { NotificationController };
