from flask import Flask,request,session, redirect,url_for
import json
from src import db,secure,run
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = b'_ueh2434%8F4Q8z\n\xec]/'
cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/run',methods=['POST','GET'])
def run_it():
	return run.run(request.json["code"],request.json["input"],request.json["ext"])

@app.route('/',methods=['POST','GET'])
def index():
	(flag, username) = secure.check_session(session)   # check session for user's login
	return "Hello"

@app.route('/login',methods=['POST','GET'])
def login():
	error = -1   
	
	(flag, username) = secure.check_session(session)

	if request.method == "POST":
		username, password = secure.check_signin(request)
		if db.check_record(username, password):
			error = 1   # successful
			secure.add_username_session(username,session)
			(flag, username) = (True, username)
		else:
			error = 2    # wrong password / username
	if flag:
		return redirect(url_for("index"), code=302)
	return render_template("login.html",active=["","","","",""],error = error)

@app.route('/signup',methods=['POST','GET'])
def signup():
	error = -1
	if request.method == "POST":
		flag, username, password, email = secure.check_signup(request)
		if flag :
			if db.new_signup(username, password, email):
				error = 1
				secure.setup_environment(username)
			else:
				error = 2 # user already exists
		else:
			error = 3  # wrong info
		return redirect(url_for("login"), code=302)
	return render_template("signup.html",active=["","","","",""],error = error)