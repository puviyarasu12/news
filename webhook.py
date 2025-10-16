from flask import Flask, request
import subprocess

app = Flask(__name__)

@app.route('/payload', methods=['POST'])
def webhook():
    subprocess.call(['/home/ubuntu/news-platform/deploy.sh'])
    return 'Deployed', 200

app.run(host='0.0.0.0', port=5000)
