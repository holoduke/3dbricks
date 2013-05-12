
CLOSUREDIR = closure
CALCDEPS = $(CLOSUREDIR)/bin/calcdeps.py
FRAMEWORKDIR = js
APPDIR = lib
BUILDDIR = build

APP=${FRAMEWORKDIR}/game.js
MINIFIED=bricks3d.min.js

CALCDEPSCMD=$(CALCDEPS) -p $(CLOSUREDIR) -p $(FRAMEWORKDIR) -p ${APPDIR} -i ${APP}

all : deps

.PHONY : clean deps.js ${MINIFIED}

clean : 
	rm -f deps.js
	rm -f ${MINIFIED}

deps : deps.js

release : ${MINIFIED}

$(BUILDDIR)/compiler.jar :
	wget http://closure-compiler.googlecode.com/files/compiler-latest.zip
#	curl -O http://closure-compiler.googlecode.com/files/compiler-latest.zip
#	fetch http://closure-compiler.googlecode.com/files/compiler-latest.zip
#	echo "Don't know how to download files! Please download the Google Closure Compiler manually to the build/ directory."
	unzip compiler-latest.zip -d $(BUILDDIR)
	rm compiler-latest.zip

${MINIFIED} : $(BUILDDIR)/compiler.jar
	${CALCDEPSCMD} -c $(BUILDDIR)/compiler.jar -o compiled > $@

deps.js :
	$(CALCDEPSCMD) -o deps > $@
