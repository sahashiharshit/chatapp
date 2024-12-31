import DataService from "../services/DataService.js";

class Chatstore {
  constructor() {
    this.storechat = async (req, res) => {
      try {
        const { groupId, userId, message } = req.body;
        const chat = await DataService.storeInDb(groupId, userId, message);
       
        res.status(201).json({chat});
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json(error);
      }
    };
    this.getMessages = async (req, res) => {
      try {
        const { groupId,userId } = req.query;
      
        
        const messages = await DataService.getAllMessages(groupId, userId);
        
        res.status(200).json({messages});
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({error});
      }
    };
  }
}
export default new Chatstore();
