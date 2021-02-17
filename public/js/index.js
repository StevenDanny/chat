const socket = io();

socket.emit("comites");

socket.on("comitesUsuario", (comites) => {
  console.log(comites);
});
