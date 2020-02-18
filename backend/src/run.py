import os
import random
import string

def run(code,input,ext):
    fcode, finput = create_files(code, input, ext)

    foutput = ''.join(random.choices(string.ascii_uppercase + string.digits, k = 7)) + ".txt" 

    os.system(get_command(fcode, finput, foutput, ext))

    with open(foutput, "r") as f:
        data = f.read()

    delete_files(fcode, finput, foutput)

    return data
    
def get_command(fcode,finput,foutput,ext):
    if ext == '.py':
        return "python " + fcode + " < " + finput + " > " + foutput
    elif ext == '.cpp':
        return "g++ " + fcode + " && ./a.out < " + finput + " > " + foutput
    elif ext == ".c":
        return "gcc " + fcode + " && ./a.out < " + finput + " > " + foutput

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

def delete_files(fcode,finput, foutput):
    os.remove(fcode) 
    os.remove(finput)
    os.remove(foutput)