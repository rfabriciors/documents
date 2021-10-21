import flask
import os
import time
from flask import Flask, render_template, jsonify

health = True
ready = True

app = flask.Flask(__name__)
app.config["DEBUG"] = True

def current_milli_time():
    return round(time.time() * 1000)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/health')
def healthcheck():
    if health:
        return render_template("health.html")
    else:
        return 'bad request!', 400

@app.route('/sethealth')
def sethealth():
    global health
    health = False
    chopstick = {
        'health': health
    }
    return jsonify(chopstick)

@app.route('/ready')
def readycheck():
    if ready:
        return render_template("health.html")
    else:
        return 'bad request!', 400

@app.route('/setunready/<int:time_unv>')
def setunready(time_unv):
    timer = current_milli_time()
    global ready
    ready = False
    chopstick = {
        'ready': ready
    }
    while current_milli_time() < timer + time_unv*1000:
        ready = False
    ready = True
    return jsonify(chopstick)

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port="5000")