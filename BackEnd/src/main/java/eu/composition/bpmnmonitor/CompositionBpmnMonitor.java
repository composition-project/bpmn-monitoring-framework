package eu.composition.bpmnmonitor;

import eu.composition.bpmnmonitor.rest.Server;


public class CompositionBpmnMonitor {

	public static void main(String[] args) throws Exception {

		final Server server = new Server(4567);
		server.startServer();
		
		Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {
			@Override
			public void run() {
				System.out.println("Shutdown hook ran!");
				server.stopServer();
			}
		}));

	}
}