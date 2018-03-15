# COMPOSITION BPMN Monitoring Framework - BackEnd

This directory stores the source code for backend program. The backend is developed in Java with Maven as the building system.

## Build Instructions
Build a fat jar:
```bash
mvn package
```
Run the jar:
```bash
java -jar target/BpmnMonitor.jar
```
To customize parameters for the program:
```bash
java -jar target/BpmnMonitor.jar -p 8080 -dfm <DFM Endpoint>
```

The ``-p`` argument specifies the port the program listens to; ``-dfm`` specifies the endpoint of DFM. Right now, the default endpoint is: http://130.192.86.227:8080/composition/resources/dfm