package eu.composition.bpmnmonitor.exception;

/**
 * Created by liang on 05.03.2018.
 */
public class DFMException extends Exception {

    public DFMException(Throwable throwable) {
        super(throwable);
    }

    public DFMException(String message) {
        super(message);
    }

    public DFMException(String message, Throwable throwable) {
        super(message, throwable);
    }
}
