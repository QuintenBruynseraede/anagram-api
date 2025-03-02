let socket;
let isProcessing = false;
let isConnected = false;
let numResults = 0;

const resultsDiv = document.getElementById("results");
const anagramsList = document.getElementById("anagrams-list");
const userInput = document.getElementById("user-input");
const generateButton = document.getElementById("generate");
const progressSpinner = document.getElementById("progress-spinner");

function appendMessage(message) {
  const result = document.createElement("div");
  result.innerHTML = `
<li class="p-4 hover:bg-gray-50 transition">
  <span class="text-gray-800 font-medium">${message}</span>
</li>`;
  anagramsList.appendChild(result);
}

function clearMessages() {
  anagramsList.innerHTML = "";
}

function startProcessing() {
  isProcessing = true;
  generateButton.disabled = true;
  generateButton.classList.add("cursor-not-allowed");
  generateButton.classList.add("bg-neutral-300");
  generateButton.classList.remove("hover:bg-blue-800");
  userInput.disabled = true;
  resultsDiv.classList.remove("hidden");
  progressSpinner.classList.remove("hidden");
}

function stopProcessing() {
  isProcessing = false;
  generateButton.disabled = false;
  generateButton.classList.remove("cursor-not-allowed");
  generateButton.classList.remove("bg-neutral-300");
  generateButton.classList.add("hover:bg-blue-800");
  userInput.disabled = false;
  progressSpinner.classList.add("hidden");
}

function connect() {
  return new Promise((resolve, reject) => {
    if (isConnected && socket && socket.readyState === WebSocket.OPEN) {
      resolve(); // Already connected
      return;
    }

    // Create WebSocket connection
    socket = new WebSocket(`ws://${window.location.host}/ws`);

    socket.onopen = function (_) {
      console.log("Connection established");
      isConnected = true;
      resolve();
    };

    socket.onmessage = function (event) {
      console.log(`Data received from server: ${event.data}`);
      appendMessage(event.data);
      numResults++;

      // Check if the message indicates processing is complete
      if (event.data.includes("[Done]")) {
        stopProcessing();
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
      isProcessing = false;

      // If we were in the middle of processing, enable the UI again
      if (isProcessing) {
        stopProcessing();
      }

      reject(new Error("Connection closed"));
    };

    socket.onerror = function (error) {
      console.log(`WebSocket error: ${error.message}`);
      appendMessage(`Error: ${error.message}`);

      // Update UI
      isConnected = false;

      reject(error);
    };
  });
}

async function findAnagrams() {
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
    startProcessing();

    if (!isConnected) {
      await connect();
    }

    // Send data to server
    socket.send(data);
    clearMessages();
  } catch (error) {
    stopProcessing();
  }
}

generateButton.addEventListener("click", findAnagrams);
generateButton.addEventListener("keypress", function (e) {
  if (e.key === "Enter" && !isProcessing) {
    findAnagrams();
  }
});
