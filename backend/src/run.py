import os
import random
import string
from src import db
import json

def run(code,input,ext):
    if ext == '.cpp14' or ext == '.cpp11' or ext == '.cpp17':
        extension = '.cpp'
    elif ext == '.py3':     
        extension = '.py'
    else :
        extension = ext
    fcode, finput = create_files(code, input, extension)

    foutput = ''.join(random.choices(string.ascii_uppercase + string.digits, k = 7)) + ".txt" 

    commands = get_command(fcode, finput, foutput, ext)
    print(commands)
    for i in commands:
        os.system(i)
        with open(foutput, "r") as f:
            data = f.read()
        if data != "":
            break

    delete_files(fcode, finput, foutput)

    return data
    
def get_command(fcode,finput,foutput,ext):
    if ext == '.py3':
        return ["python " + fcode + " < " + finput + " > " + foutput + " 2>&1 "]
    elif ext == '.cpp14':
        return ["g++ -std=c++14 " + fcode + " 2> " + foutput, "./a.out < " + finput + " > " + foutput + " 2>&1 "]
    elif ext == '.cpp11':
        return ["g++ -std=c++11 " + fcode + " 2> " + foutput, "./a.out < " + finput + " > " + foutput + " 2>&1 "]
    elif ext == '.cpp17':
        return ["g++ -std=c++17 " + fcode + " 2> " + foutput, "./a.out < " + finput + " > " + foutput + " 2>&1 "]
    elif ext == ".c":
        return ["gcc " + fcode + " 2> " + foutput, "./a.out < " + finput + " > " + foutput + " 2>&1 "]

def create_files(code, input_file, ext):
    fcode = ''.join(random.choices(string.ascii_uppercase + string.digits, k = 7)) 
    fcode += ext
    finput = ''.join(random.choices(string.ascii_uppercase + string.digits, k = 7))
    finput += ".txt"

    with open(fcode, "w") as f:
        f.write(code)
    
    with open(finput, "w") as f:
        f.write(input_file)

    return (fcode,finput)

def extract_extension(filename):
    return os.path.splitext(filename)[1]

def delete_files(fcode,finput, foutput):
    os.remove(fcode) 
    os.remove(finput)
    os.remove(foutput)

def run_testcases(file_id, parent,ext):
    testcases = json.loads(db.load_testcases(file_id))
    new_testcases = []
    file_content, filename = db.get_file_content_from_id(file_id)
    for test in testcases:
        out = run(file_content,test[2],ext)
        if out.strip() == test[3].strip():
            db.change_testcase_status(test[0],1)   # 2 means right
            test[-1] = 1
        else :
            db.change_testcase_status(test[0],2)   # 2 means wrong
            test[-1] = 2
        new_testcases.append(test)
    return json.dumps(new_testcases)
        
