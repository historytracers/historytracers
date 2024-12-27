package main

import (
    "fmt"
    "io/ioutil"
    "os"
    "strconv"
    "encoding/json"
    "log"
    "net/http"
)

type Config struct {
    DevMode bool `json:"devmode"`
    Port    int  `json:"port"`
}

func HTLoadCondig() *Config {
   jsonFile, err := os.Open("users.json")
   if err != nil {
        ret := Config{DevMode: false, Port: 12345}
        return &ret;
   }
   defer jsonFile.Close()

   byteValue, _ := ioutil.ReadAll(jsonFile)

   var cfg Config

   json.Unmarshal(byteValue, &cfg)

   return &cfg
}

func main() {
    cfg := HTLoadCondig()
    devM := "with"
    if cfg.DevMode == false {
        devM += "out"
    }
    fmt.Println("Listening Port", cfg.Port, devM, "devmode")

    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        http.ServeFile(w, r, r.URL.Path[1:])
    })

    usePort := ":"+strconv.Itoa(cfg.Port)
    log.Fatal(http.ListenAndServe(usePort, nil))
}
