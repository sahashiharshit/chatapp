import DataService from "../services/DataService.js";

class Chatstore {
  constructor() {
    this.storechat = async (data) => {
      try {
        const { groupId, userId, message } = data;
        const savedMessage = await DataService.storeInDb(groupId, userId, message);
       
       return savedMessage;
      } catch (error) {
        throw new Error('Error saving message:'+ error.message);
      }
    };
    this.getMessages = async (req, res) => {
      try {
        const { groupId,userId } = req.query;
      
        
        const messages = await DataService.getAllMessages(groupId, userId);
        
        res.status(200).json(messages);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({error});
      }
    };
    this.getMessagesAccToTimestamp=async(req,res)=>{
    try {
      const {groupId,userId}=req.query;
      const timestamp= req.params.timestamp;
      //console.log(timestamp)
      const messages = await DataService.getMessagesAccordingtoTimestamp(groupId,userId,timestamp);
      //console.log(messages);
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({error});
    }
   
    
    };
  }
}
export default new Chatstore();
