from flask import Flask
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


from controllers import device, units, login

app.register_blueprint(login.loginRouter, url_prefix="/login")
app.register_blueprint(device.deviceRouter, url_prefix="/api/device")
app.register_blueprint(units.unitsRouter, url_prefix="/api/units")


@app.route("/")
def index():
    return app.send_static_file("index.html")
