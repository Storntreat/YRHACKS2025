//dom content loaded is checking if the page is loaded
document.addEventListener("DOMContentLoaded", () => {
  // sets up the canvas and brush
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.fillStyle = "black";
  ctx.lineWidth = 4;
  // conditional to help with drawing
  let mouseDown = false;

  // draw ink if mouse is down and moving
  canvas.addEventListener("mousemove", (event) => {
    if (!mouseDown) return;
    const border = canvas.getBoundingClientRect();
    ctx.lineTo(event.clientX - border.left, event.clientY - border.top);
    ctx.stroke();
  });

  // detect if mouse is held down --> start drawing
  canvas.addEventListener("mousedown", (event) => {
    mouseDown = true;
    const border = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(event.clientX - border.left, event.clientY - border.top);
    ctx.stroke();
    ctx.stroke();
    ctx.stroke();
  });

  // mouse up --> stop drawing
  document.addEventListener("mouseup", (event) => {
    mouseDown = false;
    ctx.closePath();
  });

  // reset button
  const resetButton = document.getElementById("resetButton");
  resetButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // submit button
  const submitButton = document.getElementById("submitButton");
  submitButton.addEventListener("click", async () => {
    const prompt = document.getElementById("promptInput").value;
    const imageData = canvas.toDataURL("image/png");

    // try... catch is used if the image fetching doesnt work so it can handle the errors
    try {
      // sends POST request to backend (generate function)
      const res = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, prompt: prompt }),
      });

      // extracts image url from response by parsing as JSON (like a dictionary)
      const result = await res.json();
      const outputURL = result.output;


      //shows result
      const outputBoard = document.querySelector(".generateboard");
      // replaces it with an img tag with the image
      outputBoard.innerHTML = `<img src="${outputURL}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 20px;" />`;
    } catch (err) {
      // if had an error
      alert("Something went wrong generating the image");
    }
  });
});
