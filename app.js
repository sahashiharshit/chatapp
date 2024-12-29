import express from "express";
import cors from "cors";
import fs from "fs";
import { sequelize } from "./config/database.js";
import routes from "./router/index.js";
import path from "path";
import { fileURLToPath } from "url";
// import session from "express-session";
// import SequelizeStore from 'connect-session-sequelize';
// import { isAuthenticated } from "./middleware/authenticate.js";
// import cookieParser from "cookie-parser";

const app = express();
const port = 3000;
const privateKey = fs.readFileSync("private.pem", "utf-8");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const SessionStore = SequelizeStore(session.Store);
// const store =new SessionStore({
//     db:sequelize,
// });
// app.use(cookieParser());

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = ["http://127.0.0.1:3000", "http://localhost:3000"];

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
// app.use(

//   session({
//       secret:privateKey,
//       store:store,
//       resave:false,
//       saveUninitialized:false,
//       cookie:{
//       secure:false,
//       httpOnly:true,
//       sameSite:'strict',
//       maxAge:1000*60*60*2,

//       },
//   })
//   );
//   store.sync();

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

//Start Server
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
