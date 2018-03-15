package eu.composition.bpmnmonitor.rest;


import java.io.File;

import static spark.Spark.*;

public class Server {

    private String STATIC_PATH = "/public";

    private int port;
    private String dfmEndpoint;



    public Server(int port, String dfmEndpoint) {
        this.port = port;
        this.dfmEndpoint = dfmEndpoint;
    }

    public void startServer() {
        // Set server port
        port(port);

        // Set the path for serving static file
        // It is a relative path to resources file (src/main/resources)
        staticFiles.location(STATIC_PATH);

        // Only for development
        // String absPath = new File("src\\main\\resources\\public").getAbsolutePath();
        // staticFiles.externalLocation(absPath);

        // APIs related to BPMN models
        get("/rest/bpmn/local", RestController.getLocalBpmn());
        post("/rest/bpmn/local", RestController.setLocalBpmn());
        get("/rest/bpmn/remote", RestController.getRemoteBpmnList(dfmEndpoint));
        get("/rest/bpmn/remote/:id", RestController.getRemoteBpmn(dfmEndpoint));
        post("/rest/bpmn/remote", RestController.setRemoteBpmn(dfmEndpoint));

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
