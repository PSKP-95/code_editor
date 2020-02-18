import pymysql, hashlib

def connection():
	conn = pymysql.connect('localhost','root','pskp@a95a','neural_builder')
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

def check_network(username,file_name,status = 0):
	conn, cur = connection()

	sql = """SELECT * FROM networks where author = %s and file_name = %s"""
	args = (username,file_name)

	cur.execute(sql,args)

	data = cur.fetchall()
	if not status and len(data)>0:
		print("[src.db.check_networks] : Network Exists")
		return True
	elif status and len(data)>0:
		print("[src.db.check_networks] : Returning list Network")
		return (True, data)
	return False


def add_network_entry(username,file_name):
	if check_network(username,file_name):
		return True

	conn, cur = connection()

	sql = """insert into networks(author,file_name) values(%s,%s)"""

	args = (username,file_name)

	cur.execute(sql,args)

	# if you are writing to db then commit and close required
	conn.commit()
	conn.close()

	return True	


def my_networks(username):
	conn, cur = connection()

	sql = """SELECT * FROM networks where author = %s"""
	args = (username)

	cur.execute(sql,args)

	data = cur.fetchall()

	return data

def add_dataset_entry(dataset,description,features,samples,username,filename,size):
	print('db@add_dataset_entry')
	conn, cur = connection()

	sql = "insert into datasets(name,file_name,size,description,features,samples,author) values('"+dataset+"','"+filename+"',"+str(size)+",'"+description+"',"+features+","+samples+",'"+username+"')"

	cur.execute(sql)
	print("db@add_dataset_entry : Adding Entry")
	# if you are writing to db then commit and close required
	conn.commit()
	conn.close()

	return True	


def my_datasets(username):
	conn, cur = connection()

	sql = """SELECT * FROM datasets where author = %s"""
	args = (username)

	cur.execute(sql,args)

	data = cur.fetchall()

	return data

def network(id):
	conn, cur = connection()

	sql = "SELECT * FROM networks where net_id = " + str(id)

	cur.execute(sql)

	data = cur.fetchall()
	print(data)
	for i in data:
		return (i[1],i[2]) #username and filename

def dataset(id):
	conn, cur = connection()

	sql = "SELECT * FROM datasets where dataset_id = " + str(id)
	cur.execute(sql)

	data = cur.fetchall()
	print(data)
	for i in data:
		return i[2] #username and filename

def remove_network(username,id):
	conn, cur = connection()

	sql = "DELETE FROM networks WHERE net_id = " + str(id)
	cur.execute(sql)
	conn.commit()
	conn.close()

def remove_dataset(username,id):
	conn, cur = connection()

	sql = "DELETE FROM datasets WHERE dataset_id = " + str(id)
	cur.execute(sql)
	conn.commit()
	conn.close()