const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  getRoomUsers,
  userLeave,
} = require("./utils/users");
const getComites = require("./backend/comite");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("comites", async () => {
    let comites = [];
    comites = await getComites();
    console.log(comites);
    socket.emit("comitesUsuario", comites);
  });

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    socket.emit(
      "message",
      formatMessage(
        "CIPT",
        `${user.username} bienvenido al comité ${user.room}.`
      )
    );
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("CIPT", `${user.username} se unió al chat`)
      );
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chatMessage", async (msg) => {
    const user = getCurrentUser(socket.id);
    const data = formatMessage(user.username, msg);
    io.to(user.room).emit("message", data);
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("CIPT", `${user.username} dejó el chat.`)
      );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
