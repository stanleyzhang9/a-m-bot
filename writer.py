from flask import Flask, request
app = Flask(__name__)
@app.route('/', methods=['POST'])
def result():
    rip = request.form['data']
    tf = open("new_file", "w")
    tf.write(rip)
    tf.close()
    return 'received'
