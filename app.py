# import flask
from flask import Flask, render_template, session, copy_current_request_context
# import flaskIO
from flask_socketio import SocketIO, emit, disconnect
# import package to read csv and iterator tools
import csv
import itertools
import os
from threading import Lock

async_mode = None
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socket_ = SocketIO(app, async_mode=async_mode, cors_allowed_origins="https://mbenson-assignment3-3f7eb99f42fc.herokuapp.com/")
thread = None
thread_lock = Lock()



def get_data():
    # Get the directory of the current script
    dir_path = os.path.dirname(os.path.realpath(__file__))
    # get the directory for the data
    csv_path = os.path.join(dir_path, "static", "data", "Kaggle_TwitterUSAirlineSentiment.csv")
    # open the data specifying the encoding used
    with open(csv_path, encoding="utf-8-sig") as csv_file:
        # set data using the csv file and naming the delimiter
        data = csv.reader(csv_file, delimiter=',')
        # set first line to true so that the first line is avoided
        first_line = True
        # create an array to store the results
        tweet_data = []
        # iterate through the data adding it to tweetData
        for row in data:
            # if we are not on the first line run this code
            if not first_line:
                tweet_data.append({
                    "id": row[0],
                    "airline_sentiment": row[1],
                    "airline_sentiment_confidence": row[2],
                    "negative_reason": row[3],
                    "airline": row[4],
                    "name": row[5],
                    "text": row[6],
                    "tweet_created": row[7],
                    "tweet_location": row[8]
                })
            # if we are on the first line set first line to False so that the next line will be read
            else:
                first_line = False
        return tweet_data


def bubble_sort(array):
    n = len(array)
    for i in range(n):
        already_sorted = True
        for j in range(n-i-1):
            if array[j]["airline_sentiment_confidence"] > array[j+1]["airline_sentiment_confidence"]:
                array[j], array[j+1] = array[j+1], array[j]
                already_sorted = False
        if already_sorted:
            break
    return array

# route = localhost
@app.route('/')
def index():
    return render_template("index.html")


# route = localhost/basic
@app.route('/basic')
def basic():
    tweet_data = get_data()
    # sort the data using the bubble sort above
    bubble_sort(tweet_data)
    # limit the amount of data returned.
    return_data = itertools.islice(tweet_data, 40)
    # render the file using the template of basic.html.
    return render_template("basic.html", tweetData=return_data)

@app.route('/advanced')
def advanced():
    return render_template("advanced.html")

@app.route('/report')
def report():
    return render_template("report.html")


@app.route('/creative')
def creative():
    return render_template("creative.html")

@app.route('/socket')
def socket():
    return render_template("socket.html", async_mode=socket_.async_mode)

# socket implementation below

@socket_.on('my_event', namespace='/test')
def test_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': message['data'], 'count': session['receive_count']})


@socket_.on('my_broadcast_event', namespace='/test')
def test_broadcast_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': message['data'], 'count': session['receive_count']},
         broadcast=True)


@socket_.on('disconnect_request', namespace='/test')
def disconnect_request():
    @copy_current_request_context
    def can_disconnect():
        disconnect()

    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': 'Disconnected!', 'count': session['receive_count']},
         callback=can_disconnect)

# start in debugging mode
if __name__ == '__main__':
    socket_.run(app, debug=True)