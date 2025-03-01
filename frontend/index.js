let socket;
let isProcessing = false;
let isConnected = false;

const messageLog = document.getElementById("messageLog");
const statusDisplay = document.getElementById("status");
const userInput = document.getElementById("userInput");
const processButton = document.getElementById("processButton");

function appendMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  messageElement.style.marginBottom = "5px";
  messageLog.appendChild(messageElement);
}

function clearMessages() {
  messageLog.innerHTML = "";
}

function connect() {
  return new Promise((resolve, reject) => {
    if (isConnected && socket && socket.readyState === WebSocket.OPEN) {
      resolve(); // Already connected
      return;
    }

    // Create WebSocket connection
    socket = new WebSocket(`ws://${window.location.host}/ws`);

    socket.onopen = function (e) {
      console.log("Connection established");
      statusDisplay.textContent = "Connected";
      statusDisplay.className = "status processing";
      isConnected = true;
      resolve();
    };

    socket.onmessage = function (event) {
      console.log(`Data received from server: ${event.data}`);
      appendMessage(event.data);

      // Check if the message indicates processing is complete
      if (event.data.includes("[Done]")) {
        isProcessing = false;
        statusDisplay.textContent = "Idle";
        statusDisplay.className = "status idle";
        processButton.disabled = false;
        userInput.disabled = false;
      }
    };

    socket.onclose = function (event) {
      isConnected = false;

      if (event.wasClean) {
        console.log(
          `Connection closed cleanly, code=${event.code} reason=${event.reason}`,
        );
      } else {
        console.log("Connection died");
      }

      // Update UI
      statusDisplay.textContent = "Idle";
      statusDisplay.className = "status idle";
      isProcessing = false;

      // If we were in the middle of processing, enable the UI again
      if (isProcessing) {
        processButton.disabled = false;
        userInput.disabled = false;
        isProcessing = false;
      }

      reject(new Error("Connection closed"));
    };

    socket.onerror = function (error) {
      console.log(`WebSocket error: ${error.message}`);
      appendMessage(`Error: ${error.message}`);

      // Update UI
      statusDisplay.textContent = "Error";
      statusDisplay.className = "status idle";
      isConnected = false;

      reject(error);
    };
  });
}

async function processData() {
  const data = userInput.value;
  if (!data) {
    appendMessage("Please enter some data to process");
    return;
  }

  if (isProcessing) {
    appendMessage("Already processing data, please wait");
    return;
  }

  try {
    // Set processing state
    isProcessing = true;
    statusDisplay.textContent = "Generating...";
    statusDisplay.className = "status processing";
    processButton.disabled = true;
    userInput.disabled = true;

    // Ensure we're connected before sending
    if (!isConnected) {
      await connect();
    }

    // Send data to server
    socket.send(data);
    clearMessages();
  } catch (error) {
    isProcessing = false;
    processButton.disabled = false;
    userInput.disabled = false;
  }
}

processButton.addEventListener("click", processData);
userInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter" && !isProcessing) {
    processData();
  }
});
