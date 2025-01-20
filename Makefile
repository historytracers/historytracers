install_modules:
	cd src/webserver && go get github.com/google/uuid && go get -u github.com/tdewolff/minify/v2
all:
	bash ./ht2pkg.sh
	go run src/history_tracers.go

pkg:
	bash ./ht2pkg.sh

dev:
	cd src/webserver/ && go fmt *.go && go build -ldflags="-X 'main.confPath=/etc/historytracers/' -X 'main.srcPath=/var/www/historytracers/' -X 'main.contentPath=/var/www/historytracers/www/'"
	mv src/webserver/historytracers .

clean:
	rm -rf historytracers
