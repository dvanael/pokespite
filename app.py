from flask import Flask, request, render_template, send_file
import requests
import os
from io import BytesIO
from zipfile import ZipFile

app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        data = request.get_json()
        images = {}

        for pokemon in data:
            name = pokemon["name"]
            icon_url = pokemon["icon"]

            if icon_url:
                response = requests.get(icon_url)
                response.raise_for_status()
                if len(data) == 1:
                    file_name = f"{name}.png"
                    return send_file(
                        BytesIO(response.content),
                        mimetype="image/png",
                        as_attachment=True,
                        download_name=file_name,
                    )
                else:
                    images[name] = BytesIO(response.content)

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
    app.run(debug=True, use_reloader=True)
