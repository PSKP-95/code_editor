import pymysql, hashlib, json
import sqlite3

DATABASE = "sqlite3"

def connection():
	if DATABASE == "mysql":
		conn = pymysql.connect('https://99.000webhost.io','id12766381_root','pskp@a95a','id12766381_code_rtc')
		cur = conn.cursor()
	elif DATABASE == "sqlite3":
		conn = sqlite3.connect("code_RTC.db")
		cur = conn.cursor()
	return (conn,cur)

def get_SHA256(password):
	encoded = password.encode('utf-8')
	hash_object = hashlib.sha256(encoded)
	password = hash_object.hexdigest()
	return password
# 
def check_record(username,password):
	conn,cur = connection()

	sql = """SELECT * FROM users where username = %s and password = %s"""

	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")

	password = get_SHA256(password)

	args = (username,password)
	cur.execute(sql,args)
	data = cur.fetchall()
	if(len(data)>0):
		print("[src.db.check_record] : Record Found")
		return True
	return False

def check_user_exist(username):
	conn, cur = connection()
	sql = """SELECT * FROM users where username = %s"""
	args = (username)

	cur.execute(sql,args)
	data = cur.fetchall()
	if(len(data)>0):
		print("[src.db.check_user_exist] : User Exists")
		return True
	return False


# new user adding to db
def new_signup(username, password, email):
	if check_user_exist(username):
		return False

	conn, cur = connection()

	sql = """insert into users(username,email,password) values(%s,%s,%s)"""

	password = get_SHA256(password)

	args = (username,email,password)

	cur.execute(sql,args)

	# if you are writing to db then commit and close required
	conn.commit()
	conn.close()

	return True

def get_dir_content(dir_id):

	conn, cur = connection()

	sql = "select node_id, node, type, parent, flag from bucket where parent = %s order by node"
	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")
	args = (dir_id,)
	
	cur.execute(sql,args)
	data = cur.fetchall()

	conn.commit()
	conn.close()

	return json.dumps(data)

def check_dir(folder,parent):
	conn, cur = connection()

	sql = "select * from bucket where parent = %s and node = %s"

	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")
	args = (parent,folder)

	cur.execute(sql,args)
	data = cur.fetchall()
	
	conn.commit()
	conn.close()
	
	if len(data) > 0:
		return True
	
	return False

def make_dir(folder, parent):
	if check_dir(folder,parent):
		return "Folder already exist"

	conn, cur = connection()

	sql = """insert into bucket(type,node,file,parent) values(1,%s,"",%s)""" # type = 1 means folder

	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")

	args = (folder, parent)

	cur.execute(sql,args)

	# if you are writing to db then commit and close required
	conn.commit()
	conn.close()

	return "folder created successfully"

def get_file_content(filename,parent):
	conn, cur = connection()

	sql = "select * from bucket where parent = %s and node = %s"

	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")

	args = (parent,filename)

	cur.execute(sql,args)
	data = cur.fetchall()
	
	conn.commit()
	conn.close()
	if len(data) == 0:
		return "file not found"
	return json.dumps(data[0])

def get_file_content_from_id(file_id):
	conn, cur = connection()

	sql = "select file, node from bucket where node_id = %s"

	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")
	
	args = (file_id,)

	cur.execute(sql,args)
	data = cur.fetchall()
	
	conn.commit()
	conn.close()
	if len(data) == 0:
		return "file not found"
	return data[0]

def create_file(filename, parent, content):
	if check_dir(filename,parent):
		return "file already exist"

	conn, cur = connection()

	sql = """insert into bucket(type,node,file,parent) values(0,%s,%s,%s)""" # type = 1 means folder

	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")

	args = (filename,content, parent)

	cur.execute(sql,args)

	# if you are writing to db then commit and close required
	conn.commit()
	conn.close()

	return "file created successfully"

def add_content(filename, parent, content):
	print("Ho",filename,parent)
	if not check_dir(filename,parent):
		return "file not exist"

	conn, cur = connection()

	sql = """update bucket set file = %s where node = %s and parent = %s"""

	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")


	args = (content, filename, parent)

	cur.execute(sql,args)

	# if you are writing to db then commit and close required
	conn.commit()
	conn.close()

	return "content added successfully"

def add_testcase(file_id, input_data, output):
	conn, cur = connection()

	sql = """insert into tests(type, input, output, node_id) values(0, %s, %s, %s)"""

	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")
	
	args = (input_data, output, file_id)

	cur.execute(sql,args)

	# if you are writing to db then commit and close required
	conn.commit()
	conn.close()

	return "testcase added successfully"


def load_testcases(file_id):
	conn, cur = connection()

	sql = "select * from tests where node_id = %s"

	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")
		
	args = (file_id,)

	cur.execute(sql,args)
	data = cur.fetchall()
	
	conn.commit()
	conn.close()

	return json.dumps(data)

def change_testcase_status(test_id, status):
	conn, cur = connection()

	sql = """update tests set status = %s where test_id= %s"""

	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")
	
	args = (status, test_id)

	cur.execute(sql,args)

	# if you are writing to db then commit and close required
	conn.commit()
	conn.close()

	return True

# 1:AC, 2:WA, 3:TLE 4:RE
def change_file_flag(file_id, flag):
	conn, cur = connection()

	if flag == "AC":
		flag = 1
	elif flag == "WA":
		flag = 2
	elif flag == "TLE":
		flag = 3
	elif flag == "RE":
		flag = 4

	sql = """update bucket set flag = %s where node_id= %s"""

	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")
	
	args = (flag, file_id)
	try:
		cur.execute(sql,args)	
	except:
		return "fail"
	finally:
		# if you are writing to db then commit and close required
		conn.commit()
		conn.close()
	return "success"