
document.addEventListener("DOMContentLoaded", function(){
    var current_time = 0;
    var avgTAT = 0;
    var avgWT = 0;
    var quant = 0;

    var chart_vars;
    var processes;
    

    function getQuantum(){
        var quant = prompt("Enter Time Quantum: ");
        if(quant != null){
            return quant;
        }
    }

    function createJSON(){
        var objects = [];
    
        var table = document.getElementById('process-table');
    
        var rows = table.getElementsByTagName('tr');
        
        for(var i=1;i< rows.length;i++){
            
            var row = rows[i];
    
            var process_id = row.cells[0].textContent;
            var burst_time = row.cells[1].textContent;
            var arrival_time = row.cells[2].textContent;
            
    
            var object = {
                pid: process_id,
                bt: burst_time,
                at: arrival_time
            };
            console.log(object);
            objects.push(object);
        }

        processes = JSON.parse(JSON.stringify(objects));
        

        if(algo_type == "First Come First Serve Algorithm"){

            
            FCFScalculateCT(objects);
            avgTAT = calculateTAT(objects);
            avgWT = calculateWaitingTime(objects);

            var avg_times = {
                tat: avgTAT,
                wt: avgWT
            };
        
            objects.sort((a,b) => a.pid - b.pid);
            objects.push(avg_times);
        }
        else if(algo_type == "Shortest Job First Algorithm"){
            SJFcalculateCT(objects);
            console.log(objects)
            avgTAT = calculateTAT(objects);
            avgWT = calculateWaitingTime(objects);
        
            var avg_times = {
                tat: avgTAT,
                wt: avgWT
            };
        
            objects.sort((a,b) => a.pid - b.pid);
            objects.push(avg_times);
        }
        else if(algo_type == "Shortest Remaining Time First Algorithm"){
            SRTFcalculateCT(objects);
            console.log(objects);

            avgTAT = calculateTAT(objects);
            avgWT = calculateWaitingTime(objects);
        
            var avg_times = {
                tat: avgTAT,
                wt: avgWT
            };
        
            objects.sort((a,b) => a.pid - b.pid);
            objects.push(avg_times);
        }
        else if(algo_type == "Round Robin Algorithm"){
            RRcalculateCT(objects);
        }
        
        //Chart JS START
        chart_vars = setChartVar(processes,chart_vars);
        console.log(chart_vars);
        objects.push(chart_vars);
        

        //Chart JS END

        fetch("/results", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(objects)
        })
        .then(response => {
            if (response.ok) {
                console.log("Data sent to Flask successfully");
                window.location.href="/result";
            } else {
                console.error("Error sending data to Flask:", response.status);
            }
        })
        .catch(error => console.error("Error:", error));
        
    }

    function FCFScalculateCT(objects){
        objects.sort((a,b) => a.at - b.at);

        current_time = Number(objects[0].at);
        objects[0].ct = current_time + Number(objects[0].bt);
        current_time = Number(objects[0].ct);

        for(let i=1;i<objects.length;i++){
            if(Number(objects[i].at) > current_time){
                current_time = Number(objects[i].at);
            }

            objects[i].ct = current_time + Number(objects[i].bt);
            current_time = Number(objects[i].ct);
        }
    }

    function calculateWaitingTime(objects){

        for(let i=0;i<objects.length;i++){
            objects[i].wt = Number(objects[i].tat) - Number(objects[i].bt);
        }

        var avgWT=0;
        for(let i=0;i<objects.length;i++){
            avgWT += objects[i].wt;
        }

        avgWT = avgWT/objects.length;
        return avgWT;
    }

    function calculateTAT(objects){

        for(let i=0;i<objects.length;i++){
            objects[i].tat = Number(objects[i].ct) - Number(objects[i].at);
        }

        var avgTAT=0;
        for(let i=0;i<objects.length;i++){
            avgTAT += objects[i].tat
        }

        avgTAT = avgTAT/objects.length;
        return avgTAT;
    }


    function SJFcalculateCT(processes){

        const objects = [...processes];
        objects.sort((a,b) => a.at - b.at);

        let arrivedProcesses = [];
        let completedProcesses = [];

        function findShortestJob() {
            let shortestJob = null;
            let shortestBurstTime = Infinity;
        
            arrivedProcesses.forEach(process => {
              if (process.bt < shortestBurstTime) {
                shortestJob = process;
                shortestBurstTime = process.bt;
              }
            });
        
            return shortestJob;
          }
        
          while (arrivedProcesses.length < objects.length || arrivedProcesses.length > 0) {
            // Add newly arrived processes to the arrivedProcesses array
            while (objects.length > 0 && objects[0].at <= current_time) {
              arrivedProcesses.push(objects.shift());
            }
        
            // If no process is available at the current time, move to the next arrival
            if (arrivedProcesses.length === 0) {
              current_time = Number(objects[0].at);
              continue;
            }
        
            // Find the shortest job among arrived processes
            const shortestJob = findShortestJob();
        
            
            console.log(`Executing process ${shortestJob.pid} at time ${current_time}`);
            current_time += Number(shortestJob.bt); // Update current time
        
            // Set finish time for the current process
            shortestJob.ct = current_time;
            for(let i=0;i<objects.length;i++){
                if(shortestJob.pid === Number(objects[i].pid)){
                    objects[i].ct = current_time;
                    break;
                }
            }
            console.log(shortestJob);
        
            
            completedProcesses.push(shortestJob);
        
            // Remove the executed process from the arrivedProcesses array
            arrivedProcesses = arrivedProcesses.filter(process => process !== shortestJob);
          }
        
    }

    function SRTFcalculateCT(objects){
        const processes = [...objects];

        for(let i=0;i<processes.length;i++){
            processes[i].rt = Number(processes[i].bt);
        }

        processes.sort((a,b) => a.at - b.at);
        let arrivedprocesses = [];
        
        function findShortestJob() {
            let shortestJob = null;
            let shortestRemainingTime = Infinity;
    
            arrivedprocesses.forEach(process => {
                if (process.rt < shortestRemainingTime) {
                    shortestJob = process;
                    shortestRemainingTime = process.rt;
                }
            });
    
            return shortestJob;
        }

        while(arrivedprocesses.length < processes.length || arrivedprocesses.length>0){
            while(processes.length > 0 && processes[0].at <= current_time){
                arrivedprocesses.push(processes.shift());
            }

            if(arrivedprocesses.length === 0){
                current_time = Number(processes[0].at);
                continue;
            }

            const shortestJob = findShortestJob();
            console.log(`Executing process ${shortestJob.pid} at time ${current_time}`);
            shortestJob.rt--;
            current_time++;

            if(shortestJob.rt === 0){
                shortestJob.ct = current_time;
                for (let i = 0; i < objects.length; i++) {
                    if (shortestJob.pid === Number(objects[i].pid)) {
                        objects[i].ct = current_time;
                        break;
                    }
                }

                arrivedprocesses = arrivedprocesses.filter(process => process !== shortestJob);
            }
        }
    }

    function RRcalculateCT(objects){
        quant = getQuantum();
    }
    
    function setChartVar(processes){
        var setChartVar;
        var processes2 = JSON.parse(JSON.stringify(processes));
        var processes3 = JSON.parse(JSON.stringify(processes));

        var fcfstat,fcfswt,sjftat,sjfwt,srtftat,srtfwt;
        current_time = 0;
        FCFScalculateCT(processes);
        fcfstat = calculateTAT(processes);
        fcfswt = calculateWaitingTime(processes);

        //console.log(processes);
        //console.log(processes2);
        current_time = 0;

        SJFcalculateCT(processes2);
        sjftat = calculateTAT(processes2);
        sjfwt = calculateWaitingTime(processes2);

        current_time = 0;
        //console.log(processes2);
        //document.getElementById("hid").innerText += processes2;

        SRTFcalculateCT(processes3);
        srtftat = calculateTAT(processes3);
        srtfwt = calculateWaitingTime(processes3);

        setChartVar = {
            FCFSTAT: fcfstat,
            FCFSWT: fcfswt,
            SJFTAT: sjftat,
            SJFWT: sjfwt,
            SRTFTAT: srtftat,
            SRTFWT: srtfwt
        }

        return setChartVar;
    }

    var algo_type = document.getElementById("algo-type").innerText;
    console.log(algo_type);

    if(algo_type == "Round Robin Algorithm"){
        var quantumBut = document.getElementById("getQuantum");
        quantumBut.style.display = "block";
    }

    

    //document.getElementById("avgTAT").innerHTML = "Average TurnAround Time: "+avgTAT;
    //document.getElementById("avgWT").innerHTML = "Average  Waiting  Time : "+avgWT;

    var createJSONbut = document.getElementById("createJSON");
    createJSONbut.addEventListener('click', createJSON);

    
});

