from flask import Flask
from routes.device import deviceRouter
from routes.units import unitsRouter

app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")

app.register_blueprint(deviceRouter, url_prefix="/api/device")
app.register_blueprint(unitsRouter, url_prefix="/api/units")


@app.route("/")
def index():
    return app.send_static_file("index.html")
