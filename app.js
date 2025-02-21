import express from "express";
import cors from "cors";
import fs from "fs";
import { dbconnection } from "./config/database.js";
import routes from "./router/index.js";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import http from 'http';
import socketHandler from "./socket/socketHandler.js";
import { configDotenv } from "dotenv";

configDotenv();
const app = express();
const server =http.createServer(app);
//Start Server
const io = new Server(server,{
  cors:{origin:'*',},
  
  });
  app.set("socketio",io);
  socketHandler.handleSocketEvents(io);





//const privateKey = fs.readFileSync("private.pem", "utf-8");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = ["http://127.0.0.1:3000", "http://localhost:3000","http://3.6.134.76:3000"];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    // credentials:true,
  })
);


//Static file serving
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

//chatapp routes
app.use("/chatapp", routes);
//main route
app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});
//fallback route
app.use("*", (req, res) => {
  const requestedUrl = req.url;
  const filePath = requestedUrl.startsWith("views")
    ? path.join(__dirname, requestedUrl)
    : path.join(__dirname, "public", requestedUrl);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("Error serving file:", err.message);
      res.status(404).send("<h2>Error: File not found</h2>");
    }
    res.sendFile(filePath);
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});


(async () => {
  try {
    await dbconnection.authenticate();
    console.log("Database connected");
    server.listen(process.env.SERVER_PORT||3000, () => {
      console.log(`Server running on http://localhost:${process.env.PORT||3000}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();
