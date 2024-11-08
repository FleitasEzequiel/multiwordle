import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "node:http";
import { Server } from "socket.io";
const app = express();
const serverPort = 4000;
const server = createServer(app);

const words = ["VERDE", "ROPAS", "SEÑAS", "CIEGO", "COCHE", "AGUJA", "RADIO"];
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(morgan("dev"));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

//Rutas
app.use("/", (req, res) => res.send("ta andando"));

//Soquete
let userList = [];

let word = words[getRandomInt(words.length)];
let lastGuess = "-----";
let turno = 0;

io.on("connection", (socket) => {
  console.log("hola -->", socket.id);
  io.emit("getUsers", userList);
  io.emit("newWord", word);
  socket.emit("lastGuess", lastGuess);
  socket.on("addUser", (user) => {
    const index = userList.findIndex((el) => el.id == socket.id);
    if (index == -1) {
      userList.push(user);
    } else {
      userList[index] = user;
    }
    io.emit("getUsers", userList);
  });

  socket.on("disconnect", () => {
    const index = userList.findIndex((el) => el.id == socket.id);
    if (index != -1) {
      userList.splice(index, 1);
    }
    console.log("se ha desconectado -->", socket.id);
    io.emit("getUsers", userList);
  });

  socket.on("newGuess", (guess) => {
    if (userList[turno] == undefined) {
      console.log("no hay nadie en el turno");
      if (turno > 0) {
        turno--;
      }
      console.log("turno pasado -->", turno);
    } else {
      if (userList[turno].id == socket.id) {
        console.log("nueva adivinanza -->", guess);
        if (guess == word) {
          console.log("adivinó");
          word = words[getRandomInt(words.length)];
          io.emit("newWord", word);
          io.emit("win", socket.id);
        }
        console.log(userList.length);
        if (turno < userList.length - 1) {
          turno++;
        } else {
          turno = 0;
        }
        io.emit("turno", turno);
        io.emit("lastGuess", guess);
        lastGuess = guess;
      } else {
        console.log("no es tu turno");
      }
    }
  });
});

server.listen(serverPort, () => console.log(`server corriendo: ${serverPort}`));
