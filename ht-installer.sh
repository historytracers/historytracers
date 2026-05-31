#!/bin/bash

compile() {
    make clean
    autoreconf -f -i

    make

    LOCALPATH=`pwd`
    ./configure --with-conf-path="packaging/conf/dev.conf" --with-src-path="${LOCALPATH}/" --with-content-path="${LOCALPATH}/www/" --with-log-path="/tmp/"
    ./build/historytracers-publisher -internal -minify -audiofiles -gedcom -verbose > historytracers.log
}

compile
