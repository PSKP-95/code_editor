import pymysql, hashlib, json

def connection():
	conn = pymysql.connect('localhost','root','','code_rtc')
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

	sql = "select node_id, node, type, parent from bucket where parent = %s order by node"

	args = (dir_id)

	cur.execute(sql,args)
	data = cur.fetchall()

	conn.commit()
	conn.close()

	return json.dumps(data)

def check_dir(folder,parent):
	conn, cur = connection()

	sql = "select * from bucket where parent = %s and node = %s"

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

	args = (folder, parent)

	cur.execute(sql,args)

	# if you are writing to db then commit and close required
	conn.commit()
	conn.close()

	return "folder created successfully"

def get_file_content(filename,parent):
	conn, cur = connection()

	sql = "select * from bucket where parent = %s and node = %s"

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

	args = (file_id)

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

	args = (filename,content, parent)

	cur.execute(sql,args)

	# if you are writing to db then commit and close required
	conn.commit()
	conn.close()

	return "file created successfully"

def add_content(filename, parent, content):
	if not check_dir(filename,parent):
		return "file not exist"

	conn, cur = connection()

	sql = """update bucket set file = %s where node = %s and parent = %s"""

	args = (content, filename, parent)

	cur.execute(sql,args)

	# if you are writing to db then commit and close required
	conn.commit()
	conn.close()

	return "content added successfully"

def add_testcase(file_id, input_data, output):
	conn, cur = connection()

	sql = """insert into tests(type, input, output, node_id) values(0, %s, %s, %s)"""

	args = (input_data, output, file_id)

	cur.execute(sql,args)

	# if you are writing to db then commit and close required
	conn.commit()
	conn.close()

	return "testcase added successfully"


def load_testcases(file_id):
	conn, cur = connection()

	sql = "select * from tests where node_id = %s"

	args = (file_id)

	cur.execute(sql,args)
	data = cur.fetchall()
	
	conn.commit()
	conn.close()

	return json.dumps(data)

def change_testcase_status(test_id, status):
	conn, cur = connection()

	sql = """update tests set status = %s where test_id= %s"""

	args = (status, test_id)

	cur.execute(sql,args)

	# if you are writing to db then commit and close required
	conn.commit()
	conn.close()

	return True
