all:
	bash ./ht2pkg.sh
	go run src/history_tracers.go

pkg:
	bash ./ht2pkg.sh

dev:
	go fmt src/history_tracers.go
	go run src/history_tracers.go

clean:
	rm -rf artifacts/*
