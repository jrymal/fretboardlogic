#! /bin/bash

PID_FILE=python-server.PID
PORT_FILE=python-server.PORT
LOG_FILE=python-server.log
ERR_FILE=python-server.err

DEFAULT_PORT=8080

function start {
    if ! isRunning ; then
        port=${1:-${DEFAULT_PORT}}
        python -m SimpleHTTPServer ${port} > ${LOG_FILE} 2> ${ERR_FILE} &
        PID=$!
        echo ${PID} > ${PID_FILE}
        echo ${port} > ${PORT_FILE}
    fi
}

function stop {

    if isRunning; then
        kill $(cat ${PID_FILE})
        rm -f "${PID_FILE}"
        rm -f "${PORT_FILE}"
    fi
}

function status {
    if isRunning ; then
        echo Running: PID=$(cat ${PID_FILE}) on PORT=$(cat ${PORT_FILE})
    else
         echo Stopped
    fi
}

function isRunning {
    if [ -f ${PID_FILE} ] && [ -z "$(ps -p $(cat ${PID_FILE}) > /dev/null)" ]; then
        true
    else
        false
    fi
}

function useInfo {
    echo $1 " (start|stop|status) [port]"
    echo "start - starts the server"
    echo "stop - stops the server"
    echo "status - get the current status of the server"
}

case $1 in
    start )
        start $2;;
    stop )
        stop ;;
    status )
        ;;
    * )
        useInfo $0 ;;
esac
status 
