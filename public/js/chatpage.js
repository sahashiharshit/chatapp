import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
import ChatApp from "./ChatApp.js";

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
 function decodeQueryParams(data) {
    const decodedData = atob(data);
    return new URLSearchParams(decodedData);
  }
document.addEventListener("DOMContentLoaded",()=>{

const SERVER_URL = 'http://3.6.134.76:3000';

const encodedQueryParams = getQueryParam("data");
const params = decodeQueryParams(encodedQueryParams);
const loggedInuserId = params.get('userId');
const socketId = params.get('socketId');
const data = localStorage.getItem(`${loggedInuserId}_data`);
const socket = io(SERVER_URL,{query:{socketId,loggedInuserId}, transports: ["websocket", "polling"],});
socket.on("connect",()=>{console.log("Connected to WebSocket:", socket.id);});
socket.on("socketIdUpdated",({socketId})=>{
  console.log("Updated Socket ID:", socketId);
  localStorage.setItem(`${loggedInuserId}_socketId`, socketId);
  });

const chatapp = new ChatApp(SERVER_URL,loggedInuserId,socket);
if(!socketId || !loggedInuserId || !data){
    alert("Invalid session. Please log in again.");
    
    chatapp.logout();
    return;
}
chatapp.fetchGroups();
});

