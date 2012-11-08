import re,pdb
base = open("./base.js","r")
built = open("./4chanSP.user.js","w")
comment = re.compile("\/\/.*?#include")
fn = re.compile("#include<(.*?)>")
for line in base.readlines():
    if "#include" in line and not comment.findall(line):
        file_name = fn.findall(line)[0]
        try:
            repl = open("./" + file_name)
            data = repl.read()
            new = line.replace("#include<"+file_name+">",data)
            built.write(new)
            repl.close()
        except IOError:
            print file_name + " not found"
    else:
        built.write(line)

        
built.close()
base.close()
