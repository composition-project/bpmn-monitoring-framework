package eu.composition.bpmnmonitor.messaging;

/**
 * Created by liang on 11.01.2018.
 */
public class MachineStatus {

    private String name;
    private int targetNumber;
    private int currentNumber;
    private int onOffStatus;

    public String getName() {
        return name;
    }

    public int getOnOffStatus() {
        return onOffStatus;
    }

    public void setOnOffStatus(int onOffStatus) {
        this.onOffStatus = onOffStatus;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getTargetNumber() {
        return targetNumber;
    }

    public void setTargetNumber(int targetNumber) {
        this.targetNumber = targetNumber;
    }

    public int getCurrentNumber() {
        return currentNumber;
    }

    public void setCurrentNumber(int currentNumber) {
        this.currentNumber = currentNumber;
    }


}
