import DataService from "../services/DataService.js";

class Chatstore {
  constructor() {
    this.storechat = async (req, res) => {
      try {
        const { userId, message } = req.body;
        const result = await DataService.storeInDb(userId, message);
        res.status(201).json(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json(error);
      }
    };
    this.getMessages = async (req, res) => {
      try {
      const {after,before} = req.query;
      
        const result = await DataService.getAllMessages(after,before);
        
        res.status(200).json(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json(error);
      }
    };
  }
}
export default new Chatstore();
