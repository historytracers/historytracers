install_modules:
	cd src/webserver && go get github.com/google/uuid
all:
	bash ./ht2pkg.sh
	go run src/history_tracers.go

pkg:
	bash ./ht2pkg.sh

dev:
	cd src/webserver/ && go fmt *.go && go build
	mv src/webserver/historytracers .
	./historytracers

clean:
	rm -rf artifacts/*
