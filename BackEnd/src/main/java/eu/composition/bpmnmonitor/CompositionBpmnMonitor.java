package eu.composition.bpmnmonitor;

import eu.composition.bpmnmonitor.rest.Server;
import net.sourceforge.argparse4j.ArgumentParsers;
import net.sourceforge.argparse4j.inf.ArgumentParser;
import net.sourceforge.argparse4j.inf.ArgumentParserException;
import net.sourceforge.argparse4j.inf.Namespace;

import java.net.MalformedURLException;
import java.net.URL;


public class CompositionBpmnMonitor {

    private static final int DEFAULT_PORT = 8080;
    private static final String DEFAULT_DFM_ENDPOINT = "http://130.192.86.227:8080/composition/resources/dfm";

    private static int port;
    private static String dfmEndpoint;

    public static void main(String[] args) throws Exception {

        if(!parseArguments(args)){
            System.out.println("Program exit because of error while parsing arguments.");
            return;
        }

        final Server server = new Server(port, dfmEndpoint);
        server.startServer();

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Shutdown hook ran!");
            server.stopServer();
        }));

    }

    private static boolean parseArguments(String[] args) {
        ArgumentParser parser = ArgumentParsers.newFor("BpmnMonitor.jar").build()
                .description("The BPMN Monitoring Framework for COMPOSITION.")
                .defaultHelp(true);

        parser.addArgument("-p")
                .type(Integer.class)
                .help("The port to listen to")
                .setDefault(DEFAULT_PORT);

        parser.addArgument("-dfm")
                .type(String.class)
                .help("The end point of DFM")
                .setDefault(DEFAULT_DFM_ENDPOINT);

        Namespace res;
        try {
            res = parser.parseArgs(args);
        } catch (ArgumentParserException e) {
            System.out.println("Error while parsing arguments: " + e.getMessage());
            return false;
        }

        if ((int)res.get("p") < 0) {
            System.out.println("Port number cannot be negative.");
            return false;
        }

        try {
            new URL(res.get("dfm"));
        } catch (MalformedURLException e) {
            System.out.println("URL address not valid: " + e.getMessage());
            return false;
        }

        port = res.get("p");
        dfmEndpoint = res.get("dfm");

        return true;
    }
}