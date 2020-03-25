import pymysql, hashlib, json
import sqlite3

DATABASE = "sqlite3"

def connection():
	if DATABASE == "mysql":
		conn = pymysql.connect('https://99.000webhost.io','id12766381_root','pskp@a95a','id12766381_code_rtc')
		cur = conn.cursor()
	elif DATABASE == "sqlite3":
		conn = sqlite3.connect("data/code_RTC.db")
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

def check_dir(node,parent):
	conn, cur = connection()

	sql = "select * from bucket where parent = %s and node = %s"

	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")
	args = (parent,node)

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

	print(cur.execute(sql,args))

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

def hide_node(node_id,node_type):
	conn, cur = connection()
	
	if node_type == 0: # mean file
		sql = """update bucket set type = 2 where node_id= %s"""  # hidden file
	else:
		sql = """update bucket set type = 3 where node_id= %s"""  # hidden folder
	
	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")
	
	args = (node_id,)
	try:
		cur.execute(sql,args)	
	except :
		return "fail"
	finally:
		# if you are writing to db then commit and close required
		conn.commit()
		conn.close()
	return "success"

def delete_node(node_id,node_type):
	conn, cur = connection()

	sql1 = "delete from bucket where node_id "
	sql2 = """select node_id,type from bucket where parent= %s"""
	sql3 = "delete from tests where node_id "

	if DATABASE == "sqlite3":
		sql2 = sql2.replace("%s","?")

	node_ids = []
	stack = [(node_id,node_type)]

	while stack != []:  # stack not empty
		node = stack.pop()

		node_ids.append(node[0])

		if(node[1] == 1):  # node is folder
			try:
				cur.execute(sql2,(node[0],))
				data = cur.fetchall() 
				stack.extend(data)
			except :
				return "fail"
	try:
		if len(node_ids) > 1:
			sql1 = sql1 + "in " + str(tuple(node_ids))
			sql3 = sql3 + "in " + str(tuple(node_ids))
		elif len(node_ids) == 1 :
			sql1 = sql1 + "= " +  str(node_ids[0])
			sql3 = sql3 + "= " + str(node_ids[0])
		else :
			return "fail"
		
		cur.executescript(sql1)
	except:
		return "fail"
	finally:
		conn.commit()
		conn.close()
	return str(len(node_ids))


def rename_node(node_id,new_name):
	conn, cur = connection()
	
	sql = """update bucket set node = %s where node_id= %s""" 
	
	
	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")
	
	args = (new_name,node_id)
	try:
		cur.execute(sql,args)	
	except :
		return "fail"
	finally:
		# if you are writing to db then commit and close required
		conn.commit()
		conn.close()
	return "success"

def cut_paste(node_id,parent):
	conn, cur = connection()
	
	sql = """update bucket set parent = %s where node_id= %s""" 
	
	
	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")
	
	args = (parent,node_id)
	try:
		cur.execute(sql,args)	
	except :
		return "fail"
	finally:
		# if you are writing to db then commit and close required
		conn.commit()
		conn.close()
	return "success"

def save_note(node_id, note):
	conn, cur = connection()
	
	sql = """update bucket set note = %s where node_id= %s""" 
	
	
	if DATABASE == "sqlite3":
		sql = sql.replace("%s","?")
	
	args = (note,node_id)
	try:
		cur.execute(sql,args)	
	except :
		return "fail"
	finally:
		# if you are writing to db then commit and close required
		conn.commit()
		conn.close()
	return "success"