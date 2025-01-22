from flask import Flask, request, render_template, send_file
import requests
import os
from io import BytesIO
from zipfile import ZipFile

app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        # Recupera a string com os nomes separados por vírgula
        pokemon_names = request.form.get("pokemon_names")
        # Divide a string nos nomes individuais e remove espaços extras
        pokemon_list = [
            name.strip().lower() for name in pokemon_names.split(",") if name.strip()
        ]

        images = {}

        for pokemon in pokemon_list:
            try:
                response = requests.get(f"https://pokeapi.co/api/v2/pokemon/{pokemon}")
                response.raise_for_status()
                data = response.json()
                sprite_url = data["sprites"]["versions"]["generation-vii"]["icons"][
                    "front_default"
                ]

                if sprite_url:
                    image_response = requests.get(sprite_url)
                    image_response.raise_for_status()
                    images[pokemon] = BytesIO(image_response.content)
            except requests.exceptions.RequestException:
                images[pokemon] = None

        if images:
            zip_buffer = BytesIO()
            with ZipFile(zip_buffer, "w") as zip_file:
                for name, image_data in images.items():
                    if image_data:
                        zip_file.writestr(f"{name}.png", image_data.getvalue())
            zip_buffer.seek(0)
            return send_file(
                zip_buffer,
                mimetype="application/zip",
                as_attachment=True,
                download_name="pokemon_images.zip",
            )

    return render_template("index.html")


@app.route("/<path:path>", methods=["GET"])
def catch_all(path):
    return "404 - Page Not Found", 404


if __name__ == "__main__":
    app.run(debug=True)
