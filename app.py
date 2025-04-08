from flask import Flask, render_template, request, jsonify
import replicate
import base64
import io
from PIL import Image
import random
import requests
# imports libraries

IMGBB_API_KEY = "00e3fd8f8fb59410397ec6c1c8d4558e"

app = Flask(__name__)
#intializing flask

#connects client to replicate (it hosts the AI model)
replicate_client = replicate.Client(api_token="r8_ecVRbKDdU90NACoZ7onI01JHaMhs1Hv12UYd1")

# /generate calls a function, and it only responds to POST requests
@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    #gets sketch data
    prompt = data.get("prompt", "a cool drawing with vibrant colours")
    # ^ prompt on left of comma is replaced with the inputted prompt, on right of comma is default value
    image_data = data.get("image").split(",")[1]
    # gets raw image string by splitting the data 

    # defines imgBB (to host an image)
    imgbb_url = "https://api.imgbb.com/1/upload"
    midImage = {
        "key": IMGBB_API_KEY,
        "image": image_data
    }

    #sends image to imgBB through a POST requst
    response = requests.post(imgbb_url, data=midImage)
    #if it doesnt work:
    if response.status_code != 200:
        return jsonify({"error": "Image upload failed"}), 500

    #gets the image url 
    image_url = response.json()["data"]["url"]

    #terminal prints the imgBB link to troubleshoot (user does not see this)
    print("generated image:", image_url)

    # runs replicate AI 
    output = replicate_client.run(
        "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117", #model's prediction (basically address)
        input={ #input prompts given by model's input schema
            "image": image_url,
            "scale": 9,
            "seed": random.randint(1, 99999),
            "prompt": prompt,
            "a_prompt": "best quality, extremely detailed",
            "n_prompt": "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
            "ddim_steps": 20,
            "num_samples": "1",
            "image_resolution": "512",
        }
    )

    #terminal prints the ai image link to troubleshoot (user does not see this)
    print("generated output: " + str(output[1]))

    #sends it back to the frontend as JSON data
    return jsonify({"output": str(output[1])})

#initializes homepage
@app.route("/")
def home():
    return render_template("home.html")