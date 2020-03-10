from flask import Flask,request,session, redirect
import json
from src import db,secure,run
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = b'_ueh2434%8F4Q8z\n\xec]/'
cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/run',methods=['POST','GET'])
def run_it():
	return run.run(request.json["code"],request.json["input"],request.json["ext"])

@app.route('/dir',methods=['POST','GET'])
def dir_content():
	parent_dir_id = request.json["dir_id"]

	# node_id, node, type, parent
	return db.get_dir_content(parent_dir_id)

@app.route('/mkdir',methods=['POST','GET'])
def mkdir():
	folder = request.json["folder"]
	parent = request.json["parent"]
	
	return db.make_dir(folder,parent)

@app.route('/cat',methods=['POST','GET'])
def cat():
	filename = request.json["filename"]
	parent = request.json["parent"]
	
	return db.get_file_content(filename,parent)

@app.route('/touch',methods=['POST','GET'])
def touch():
	filename = request.json["filename"]
	parent = request.json["parent"]
	content = request.json["content"]
	
	return db.create_file(filename,parent,content)

@app.route('/edit',methods=['POST','GET'])
def edit():
	filename = request.json["filename"]
	parent = request.json["parent"]
	content = request.json["content"]
	
	return db.add_content(filename,parent,content)

@app.route('/addtest',methods=['POST','GET'])
def addtest():
	file_id = request.json["node_id"]
	input_data = request.json["input"]
	output = request.json["output"]
	
	return db.add_testcase(file_id,input_data,output)

@app.route('/loadtests',methods=['POST','GET'])
def loadtests():
	file_id = request.json["node_id"]
	
	return db.load_testcases(file_id)

@app.route('/runtests',methods=['POST','GET'])
def runtests():
	file_id = request.json["node_id"]
	parent = request.json["parent"]
	
	return run.run_testcases(file_id,parent)

@app.route('/updateflag',methods=['POST','GET'])
def updateflag():
	file_id = request.json["node_id"]
	flag = request.json["flag"]
	
	return db.change_file_flag(file_id,flag)

@app.route('/delete',methods=['POST','GET'])
def deleteNode():
	node_id = request.json["node_id"]
	node_type = request.json["type"]
	return db.delete_node(node_id, node_type)

@app.route('/rename',methods=['POST','GET'])
def renameNode():
	node_id = request.json["node_id"]
	name = request.json["name"]
	return db.rename_node(node_id, name)

@app.route('/cutpaste',methods=['POST','GET'])
def cutpaste():
	node_id = request.json["node_id"]
	parent = request.json["parent"]
	return db.cut_paste(node_id, parent)

@app.route('/',methods=['POST','GET'])
def index():
	(flag, username) = secure.check_session(session)   # check session for user's login
	return "Hello"

# @app.route('/login',methods=['POST','GET'])
# def login():
# 	error = -1   
	
# 	(flag, username) = secure.check_session(session)

# 	if request.method == "POST":
# 		username, password = secure.check_signin(request)
# 		if db.check_record(username, password):
# 			error = 1   # successful
# 			secure.add_username_session(username,session)
# 			(flag, username) = (True, username)
# 		else:
# 			error = 2    # wrong password / username
# 	if flag:
# 		return redirect(url_for("index"), code=302)
# 	return render_template("login.html",active=["","","","",""],error = error)

# @app.route('/signup',methods=['POST','GET'])
# def signup():
# 	error = -1
# 	if request.method == "POST":
# 		flag, username, password, email = secure.check_signup(request)
# 		if flag :
# 			if db.new_signup(username, password, email):
# 				error = 1
# 				secure.setup_environment(username)
# 			else:
# 				error = 2 # user already exists
# 		else:
# 			error = 3  # wrong info
# 		return redirect(url_for("login"), code=302)
# 	return render_template("signup.html",active=["","","","",""],error = error)

if __name__ == "__main__":
	app.run(host='0.0.0.0',port=8888)