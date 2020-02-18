import re
from src import db
import os, shutil

# validate email using regex
# currently not working
def validate_email(email):
	if len(email) > 7 and re.match(r'\b[\w.-]+?@\w+?\.\w+?\b', email) != None:
		return True
	return False

# unroll data and give back to caller
# both check_signup and check_signin

def check_signup(request):
	username = request.form['username']
	password = request.form['password']
	rpassword = request.form['rpassword']
	email = request.form['email']
	if password == rpassword:
		return (True,username,password,email)  # True for future use
	return (False,username,password,email)

def check_signin(request):
	username = request.form['username']
	password = request.form['password']
	return (username,password)

# check user is already logged in or not
# if logged in then who is he/she?
def check_session(session):
	if 'username' not in session or not db.check_user_exist(session['username']) :
		return (False,None)
	return (True,session['username'])

def add_username_session(username, session):
	session['username'] = username

# Create Folder for user
# create table with username as tablename for storing networks
# all datasets are public but modification, deletion rights are reserved by author
def setup_environment(username):
	os.chdir('networks')
	try:
		shutil.rmtree(username)
	except:
		print("There is previous dir present | deleted")
	os.makedirs(username)
	os.chdir('../networks')
	try:
		shutil.rmtree(username)
	except:
		print("There is previous dir present | deleted")
	os.makedirs(username)
		
def process_profile_services(session):
	session.pop('username',None)
	return (True, 1)
