document.addEventListener("keydown", (event) => {
   if (event.key === "Tab" && document.getElementById("game").style.display !== "none") {
      event.preventDefault();
      document.getElementById("chat-input").focus();
   }
});

document.getElementById("chat-input").addEventListener("keydown", (event) => {
   if (document.activeElement === event.target && event.key === "Enter" && document.getElementById("game").style.display !== "none") {
      event.preventDefault();
      const message = event.target.value;
      event.target.value = "";
      socket.emit("chat", message);
      document.getElementById("canvas").focus();
   }
});