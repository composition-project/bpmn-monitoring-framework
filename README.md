# COMPOSITION BPMN Monitoring Framework

This repository contains two folders:  
 - **BackEnd**: stores the source code for backend program. The backend is developed in Java with Maven as the building system.  
 - **WebInterface**: stores the source code for frontend web interface. The front end is developed with the help of a variety of tools such as ``npm`` for package managemet, ``browserify`` for turning CommonJS to make the code runnable in browser, and ``grunt`` for automatic build and test.
## Build Instructions
Build a docker image:
```docker
docker build -t bpmn_monitor .
```
Run the docker container:
```docker
docker run --name bpmn_monitor -p 8080:8080 bpmn_monitor
```
To customize parameters for the program:
```docker
docker run --name bpmn_monitor -p 8080:1234 bpmn_monitor -p 1234 -dfm <DFM endpoint>
```
The ``-p`` argument specifies the port the program listens to; ``-dfm`` specifies the endpoint of DFM. Right now, the default endpoint is: http://130.192.86.227:8080/composition/resources/dfm