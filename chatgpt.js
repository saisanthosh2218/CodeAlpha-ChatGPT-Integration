const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

wss.on("connection", function connection(ws) {
  ws.on("message", async function incoming(message) {
    try {
      const data = JSON.parse(message);

      if (data.type === "question") {
        const questionData = {
          type: "question",
          question: data.question,
        };

        ws.send(JSON.stringify(questionData));

        const options = {
          method: "POST",
          url: "https://chatgpt-gpt4-ai-chatbot.p.rapidapi.com/ask",
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key":
              "7690e48852msh72cf35d5c0e7b43p114836jsne8dc63bd3fdf",
            "X-RapidAPI-Host": "chatgpt-gpt4-ai-chatbot.p.rapidapi.com",
          },
          data: {
            query: data.question,
          },
        };
        const response = await axios.request(options);
        if (response.status === 200) {
          const responseData = {
            type: "response",
            response: response.data.response,
          };
          ws.send(JSON.stringify(responseData));
        } else {
          throw new Error("API request failed");
        }
        // ws.send(JSON.stringify(questionData));
      }
    } catch (error) {
      console.error(error);
      let errorMessage;
      if (error.response) {
        errorMessage = {
          type: "error",
          message:
            "An error occurred while processing your request. Please try again later.",
        };
      } else if (error.request) {
        errorMessage = {
          type: "error",
          message:
            "Network error. Please check your internet connection and try again.",
        };
      } else {
        errorMessage = {
          type: "error",
          message: "An unexpected error occurred. Please try again later.",
        };
      }
      ws.send(JSON.stringify(errorMessage));
    }
  });
});

server.listen(3500, () => {
  console.log("WebSocket server is running on port 3500");
});
