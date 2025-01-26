all:
	cd src/webserver/ && go fmt *.go && go build -ldflags="-X 'main.confPath=/etc/historytracers/' -X 'main.srcPath=/var/www/htdocs/historytracers/' -X 'main.contentPath=/var/www/htdocs/historytracers/www/' -X 'main.logPath=/var/log/historytracers/'"
	mv src/webserver/historytracers .

install: all
	cp historytracers /usr/bin

pkg:
	bash ./ht2pkg.sh

install_modules:
	cd src/webserver && go get github.com/google/uuid && go get -u github.com/tdewolff/minify/v2 && go get github.com/BurntSushi/toml@latest

clean:
	rm -rf historytracers
