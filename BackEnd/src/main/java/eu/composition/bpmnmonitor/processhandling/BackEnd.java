package eu.composition.bpmnmonitor.processhandling;

import eu.composition.bpmnmonitor.messaging.MachineStatus;
import eu.composition.bpmnmonitor.messaging.ProcessStatus;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Random;


public class BackEnd {

    private String bpmnModel;
    private int[] processedNumbers;
    private int[] previousOnOffStatus;
    private LocalDateTime dateTime;
    private ZoneId zoneId;

    public BackEnd() {
        bpmnModel = "";
        processedNumbers = new int[] {0,0,0,0,0,0,0};
        previousOnOffStatus = new int[] {0,0,0,0,0,0,0};
        dateTime = LocalDateTime.now();

        zoneId = ZoneId.systemDefault();
    }

    public String getBpmnModel(){
        return bpmnModel;
    }

    public boolean setBpmnModel(String m){
        bpmnModel = m;
        return true;
    }

    public ProcessStatus getStatus() {
        ProcessStatus ps = new ProcessStatus();

        dateTime = dateTime.plusMinutes(1);
        dateTime = dateTime.plusSeconds(27);
        ps.setTime(dateTime.atZone(zoneId).toEpochSecond());
        //ps.setTime(dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        ArrayList<MachineStatus> machineList = new ArrayList<MachineStatus>();

        for(int i=1; i < 8; i++){
            MachineStatus ms = new MachineStatus();
            Random rand = new Random();

            ms.setName("machine_" + i);

            if(previousOnOffStatus[i-1] == 0) {
                if((i-1)==0){
                    processedNumbers[i-1] ++;
                } else {
                    processedNumbers[i-1] = (processedNumbers[i-2]-1) > processedNumbers[i-1]? processedNumbers[i-1] + 1:processedNumbers[i-1];
                }
            }

            Float onOffStatusRdn = rand.nextFloat();
            if(onOffStatusRdn < 0.92) {
                ms.setOnOffStatus(0);
                previousOnOffStatus[i-1] = 0;
            } else if (onOffStatusRdn < 0.97) {
                ms.setOnOffStatus(1);
                previousOnOffStatus[i-1] = 1;
            } else {
                ms.setOnOffStatus(2);
                previousOnOffStatus[i-1] = 2;
            }

            ms.setTargetNumber(1000);
            ms.setCurrentNumber(processedNumbers[i-1]);

            machineList.add(ms);
        }

        ps.setMachines(machineList);
        return ps;
    }
}
