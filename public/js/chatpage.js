import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
import Chat from "./Chat.js";


document.addEventListener("DOMContentLoaded",()=>{

const SERVER_URL = 'http://3.6.134.76:3000' || "http://localhost:3000";
const chat = new Chat(SERVER_URL);
const encodedQueryParams = chat.getQueryParam("data");
const params = chat.decodeQueryParams(encodedQueryParams);
const loggedInuserId = params.get('userId');
const socketId = params.get('socketId');
const data = localStorage.getItem(`${loggedInuserId}_data`);
const userKey = loggedInuserId+'_data';
if(!socketId || !loggedInuserId || !data){
    alert("Invalid session. Please log in again.");
    chat.logout(userKey);
    return;
}
const socket = io(SERVER_URL,{query:{loggedInuserId,socketId}});

chat.initializeSocket(socket);
chat.fetchGroups(loggedInuserId);
chat.setupEventListeners(loggedInuserId,socket);
});

