// Explicitly selected, illustrative data. Never merged with live API records.
const hourly=[3240,3580,4120,3980,4520,4740,4280,4650,4950,4260,3790,3610];
const previous=[3100,3340,3690,3820,3970,4210,3990,4360,4490,4090,3650,3490];
const total=hourly.reduce((a,b)=>a+b,0);
export const sampleDashboard={
 summary:{totalBags:total,allTimeBags:1254280,rate:1840,perMinute:31},
 hourlyProduction:hourly.map((bags,i)=>({hour:`${String(i+6).padStart(2,'0')}:00`,bags})),
 yesterdayProduction:previous.map((bags,i)=>({hour:`${String(i+6).padStart(2,'0')}:00`,bags})),
 dailyProduction:[{day:'Mon',bags:46200},{day:'Tue',bags:47800},{day:'Wed',bags:total}],
 allTimeProduction:[{month:'Aug',bags:1124000},{month:'Sep',bags:1185000},{month:'Oct',bags:1254280}],
 godowns:[{id:'G01',name:'Godown 01',bags:18420,target:22000,rate:720,belts:2},{id:'G02',name:'Godown 02',bags:16760,target:20000,rate:660,belts:2},{id:'G03',name:'Godown 03',bags:14540,target:18000,rate:460,belts:2}],
 belts:[{id:'CV-01',name:'Bagging line 01',status:'Running',bags:12840,rate:520,camera:'CAM-01',lastEvent:'17:42:08'},{id:'CV-02',name:'Bagging line 02',status:'Running',bags:10920,rate:480,camera:'CAM-02',lastEvent:'17:42:06'},{id:'CV-03',name:'Bagging line 03',status:'Running',bags:9640,rate:460,camera:'CAM-03',lastEvent:'17:42:05'},{id:'CV-04',name:'Transfer conveyor',status:'Slow',bags:8620,rate:180,camera:'CAM-04',lastEvent:'17:41:58'},{id:'CV-05',name:'Dispatch conveyor',status:'Running',bags:7700,rate:200,camera:'CAM-05',lastEvent:'17:42:02'},{id:'CV-06',name:'Reserve conveyor',status:'Stopped',bags:0,rate:0,camera:'CAM-06',lastEvent:'16:48:21'}],
 cameras:[1,2,3,4,5,6].map(i=>({id:`CAM-0${i}`,name:`Camera 0${i}`,location:`Conveyor 0${i}`,status:i===6?'Offline':'Online',fps:i===6?0:24,note:i===6?'Connection lost':'Counting service active'})),
 alerts:[{id:'A01',title:'Reserve camera disconnected',description:'No video signal from CAM-06. Check the network connection.',location:'Reserve conveyor',time:'16:48',level:'critical'},{id:'A02',title:'Low throughput detected',description:'Transfer conveyor is operating below its configured rate.',location:'CV-04',time:'17:35',level:'warning'},{id:'A03',title:'Counting service restored',description:'Video stream and counting have resumed.',location:'CAM-03',time:'17:12',level:'resolved'}],
 anomalies:[],recentEvents:[{id:'E01',bag:'BAG-049720',location:'Bagging line 01',time:'17:42:08'},{id:'E02',bag:'BAG-049719',location:'Bagging line 02',time:'17:42:06'},{id:'E03',bag:'BAG-049718',location:'Bagging line 03',time:'17:42:05'},{id:'E04',bag:'BAG-049717',location:'Dispatch conveyor',time:'17:42:02'}],
 peakHour:{hour:'14:00 – 15:00',bags:4950},downtime:{today:18,yesterday:24},cameraStatus:{connected:true},generatedAt:'sample'
};
