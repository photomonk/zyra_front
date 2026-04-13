const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});
  
// --- THE KNOWLEDGE BASE ---
const GREETINGS = ["hi", "hello", "hey", "hola", "good morning", "good evening"];

const RESPONSES = {
  // Greetings
  "welcome": "Hello! I'm Zyra. I'm here to offer a safe space to talk or provide resources for your mental well-being. How are you feeling?",
  
  // Psychological Commands
  "/stress": "Stress can feel like a heavy weight. 🧘 Try to ground yourself: name 3 things you can hear right now. Slowing down your sensory input can help lower your cortisol.",
  "/depression": "I hear you, and I’m glad you reached out. Please remember that you don't have to navigate these feelings alone. If you're in a crisis, please text HOME to 741741 (Crisis Text Line).",
  "/anxiety": "When anxiety kicks in, your body is in 'fight or flight.' Try to lengthen your exhale—make it twice as long as your inhale to signal to your brain that you are safe.",
  "/sleep": "Trouble sleeping often comes from a busy mind. Try a 'brain dump': write down everything worrying you on paper before bed to 'park' those thoughts until morning.",

  // System
  "help": "You can talk to me normally or use these specific guides:\n- /stress\n- /depression\n- /anxiety\n- /sleep",
  "default": "I'm not quite sure I understand, but I'm listening. Try typing 'help' to see what I can do for you."
};

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId || "guest";
  console.log(`+ User connected: ${userId}`);


  socket.on("clear", () => {
    console.log(`! Clear request received from: ${userId}`);
    // Emit back to the frontend to trigger setMsgs([])
    socket.emit("cleared");
  });

  socket.on("message", ({ text }) => {
    const input = text.toLowerCase().trim();
    let reply = "";

    // 1. Check if it's a general greeting
    if (GREETINGS.includes(input)) {
      reply = RESPONSES["welcome"];
    } 
    // 2. Check if it's a specific command or defined response
    else if (RESPONSES[input]) {
      reply = RESPONSES[input];
    } 
    // 3. Fallback
    else {
      reply = RESPONSES["default"];
    }

    socket.emit("start");

    // Natural delay so it doesn't feel like a robot instant-reply
    setTimeout(() => {
      socket.emit("token", { token: reply });
      socket.emit("end");
    }, 500);
  });

  socket.on("disconnect", () => console.log(`- User disconnected: ${userId}`));
});


httpServer.listen(3000, () => console.log("Zyra Support Bot: http://localhost:3000"));