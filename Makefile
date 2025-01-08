all:
	bash ./ht2pkg.sh
	go run src/history_tracers.go

pkg:
	bash ./ht2pkg.sh

dev:
	go fmt src/webserver/*.go
	go run src/webserver/*.go

clean:
	rm -rf artifacts/*
