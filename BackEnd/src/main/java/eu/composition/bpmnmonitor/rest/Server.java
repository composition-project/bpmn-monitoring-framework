package eu.composition.bpmnmonitor.rest;

import eu.composition.bpmnmonitor.exception.DFMException;

import java.io.File;

import static spark.Spark.*;

public class Server {

    private int port;
    private String staticPath;


    public Server(int port) {
        this(port, "/public");
    }

    public Server(int port, String staticPath) {
        this.port = port;
        this.staticPath = staticPath;

    }

    public void startServer() {
        // Set server port
        port(port);

        // Set the path for serving static file
        // It is a relative path to resources file (src/main/resources)
        //staticFiles.location(staticPath);

        // Only for development
        String absPath = new File("src\\main\\resources\\public").getAbsolutePath();
        staticFiles.externalLocation(absPath);

        // APIs related to BPMN models
        get("/rest/bpmn/local", RestController.getLocalBpmn());
        post("/rest/bpmn/local", RestController.setLocalBpmn());
        get("/rest/bpmn/remote", RestController.getRemoteBpmnList());
        get("/rest/bpmn/remote/:id", RestController.getRemoteBpmn());
        post("/rest/bpmn/remote", RestController.setRemoteBpmn());

        // APIs related to current state of the process
        get("/rest/machine_status", RestController.getState());

        // Temporary return 404 when any exception happens
        exception(Exception.class, (e, req, res) -> {
            e.printStackTrace();
            res.status(404);
        });
    }

    public void stopServer() {
        stop();
    }

}
