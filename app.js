import express from "express";
import cors from "cors";
import fs from 'fs';
import { sequelize } from "./config/database.js";
import routes from "./router/index.js";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import SequelizeStore from 'connect-session-sequelize';
const app = express();
const port = 3000;
const privateKey = fs.readFileSync('private.pem', "utf-8");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SessionStore = SequelizeStore(session.Store);
const store =new SessionStore({
    db:sequelize,
});
app.use(

session({
    secret:privateKey,
    store:store,
    resave:false,
    saveUninitialized:false,
    cookie:{
    secure:false,
    maxAge:1000*60*60*2,

    },
})
);
store.sync();
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.startsWith("http://127.0.0.1:3000")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
  })
);
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});
app.get("/signup.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "signup.html"));
});
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});
app.get("/chatpage.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "chatpage.html"));
});
app.use("/chatapp", routes);




(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();
