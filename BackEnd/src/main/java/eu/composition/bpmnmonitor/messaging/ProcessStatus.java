package eu.composition.bpmnmonitor.messaging;

import java.util.List;

/**
 * Created by liang on 11.01.2018.
 */
public class ProcessStatus {

    private String time;
    private List<MachineStatus> machines;

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public List<MachineStatus> getMachines() {
        return machines;
    }

    public void setMachines(List<MachineStatus> machines) {
        this.machines = machines;
    }
}
