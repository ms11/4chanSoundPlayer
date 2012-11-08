import re,string
try:
    import install
    install.begin()
except:
    pass

def build():
    out = open("4chanSP.user.js","w");
    for f in ["header.js","lib.js","xhr.js","loadall.js","loadbytag.js",
              "loadsplitted.js","taglinks.js","globals.js","player.js","music.js",
			  "css.js","start.js"]:
        f = open("src/" + f,"r")
        l = f.readlines()
        f.close()
        out.writelines(l)
        try:
            install.lines(l)
        except:
            pass
    out.close()
    try:
        install.end()
    except:
        pass

def newversion(old,new):
    out = open("src/header.js","r")
    lines = out.readlines()
    for i in range(len(lines)):
        if "@version" in line:
            lines[i] = lines[i].replace(old,new)
    out.close()
    out = open("src/header.js","w")
    out.writelines(lines)
    out.close()
    build()

f = open("src/header.js","r")
line = f.readline()
while line:
    if "@version" in line:
        match = re.search('[0-9].*?\.[0-9]*',line)
        if not match:
            print "Error: failed to determinate current version!"
        else:
            current = match.group(0)
            print "The current version is: {0}".format(current)
            parts = current.split(".")
            subver = int(parts[1])
            subver += 1
            newver = parts[0]+"."+str(subver)
            resp = raw_input("New version [{0}]:".format(newver))
            if resp is "-":
                build()
            elif resp is "":
                newversion(current,newver)
            else:
                newversion(current,resp)
    line = f.readline()
f.close()
