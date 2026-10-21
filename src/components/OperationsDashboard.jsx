import React, {useMemo, useState} from 'react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Line, AreaChart, Area } from 'recharts';
import {Package, Gauge, Activity, Camera, ArrowUpRight, ArrowDownRight, ArrowRight, Download, RefreshCw, Warehouse, Bell, CheckCircle2, AlertTriangle, CircleOff, Search, ChevronRight, Factory, Clock3} from 'lucide-react';

const number = value => Number.isFinite(Number(value)) ? Number(value).toLocaleString('en-IN') : '—';
const percent = (value,total) => total > 0 ? Math.max(0,value/total*100) : null;
export function StatePill({value}) {
 const type = /^(running|online|operational|resolved)$/i.test(value) ? 'good' : /^(slow|warning|idle)$/i.test(value) ? 'warn' : /^(offline|stopped|critical|error)$/i.test(value) ? 'bad' : 'neutral';
 return <span className={`ops-state ${type}`}><i/>{value || 'Unknown'}</span>;
}
function Empty({icon:Icon=Activity,title,description}) {return <div className="ops-empty"><Icon size={23} strokeWidth={1.4}/><strong>{title}</strong><p>{description}</p></div>}
function Section({title,subtitle,action,children,className=''}) {return <section className={`ops-panel ${className}`}><header className="ops-panel-head"><div><h3>{title}</h3>{subtitle&&<p>{subtitle}</p>}</div>{action}</header>{children}</section>}
function MiniTrend({data,color='#22836e'}) {return <div className="ops-spark" aria-hidden="true"><ResponsiveContainer width="100%" height={35}><AreaChart data={data}><Area type="monotone" dataKey="bags" stroke={color} fill={color} fillOpacity={0.07} strokeWidth={1.7} isAnimationActive={false}/></AreaChart></ResponsiveContainer></div>}
function Metric({title,value,unit,icon:Icon,detail,trend,series,accent}) {return <article className="ops-metric"><div className="ops-metric-label">{title}<Icon size={16}/></div><div className="ops-metric-value">{value}<small>{unit}</small></div><div className="ops-metric-bottom"><div>{trend != null && <span className={`ops-delta ${trend<0?'negative':''}`}>{trend<0?<ArrowDownRight size={13}/>:<ArrowUpRight size={13}/>} {Math.abs(trend).toFixed(1)}%</span>}<span>{detail}</span></div>{series?.length>1&&<MiniTrend data={series} color={accent}/>}</div></article>}
function TrendTooltip({active,payload,label}) {if(!active||!payload?.length)return null;return <div className="ops-chart-tooltip"><strong>{label}</strong>{payload.map(p=><div key={p.dataKey}><i style={{background:p.color}}/>{p.name}<b>{number(p.value)} bags</b></div>)}</div>}
export default function OperationsDashboard({data,dataError,filter,onRefresh,onGodownClick,onNavigate,demo,lastUpdated}) {
 const [chartView,setChartView]=useState('hourly');
 const [query,setQuery]=useState('');
 const {summary={},hourlyProduction=[],yesterdayProduction=[],belts=[],godowns=[],cameras=[],alerts=[],anomalies=[],recentEvents=[],peakHour={},downtime={}}=data;
 const available=demo||Boolean(lastUpdated);
 const fmt=value=>available?number(value):'—';
 const totalTarget=godowns.reduce((sum,g)=>sum+(Number(g.target)||0),0);
 const progress=percent(summary.totalBags,totalTarget);
 const previousTotal=yesterdayProduction.reduce((sum,h)=>sum+(Number(h.bags)||0),0);
 const productionDelta=available&&previousTotal>0 ? (summary.totalBags-previousTotal)/previousTotal*100 : null;
 const online=cameras.filter(c=>c.status==='Online').length;
 const running=belts.filter(b=>b.status==='Running').length;
 const issues=alerts.length?alerts:anomalies;
 const openIssues=issues.filter(a=>a.level!=='resolved');
 const chart=useMemo(()=>{
  let cumulative=0,previous=0;
  const prev=new Map(yesterdayProduction.map(h=>[h.hour,h.bags]));
  return hourlyProduction.map(h=>{cumulative+=Number(h.bags)||0;previous+=Number(prev.get(h.hour))||0;return {hour:h.hour,current:chartView==='hourly'?h.bags:cumulative,previous:chartView==='hourly'?(prev.has(h.hour)?prev.get(h.hour):null):(yesterdayProduction.length?previous:null)};});
 },[hourlyProduction,yesterdayProduction,chartView]);
 const sources=belts.filter(b=>`${b.id} ${b.name} ${b.camera}`.toLowerCase().includes(query.toLowerCase()));
 const downloadReport=()=>{
  const rows=[['Source ID','Source','Status','Bags','Rate per hour','Camera','Last event'],...sources.map(b=>[b.id,b.name,b.status,b.bags,b.rate,b.camera,b.lastEvent])];
  const content=rows.map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob(['\uFEFF'+content],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`${demo?'sample-':''}sugar-mill-sources-${filter?.date||'current'}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return <div className="ops-dashboard">
  <div className="ops-title-row"><div><div className="ops-eyebrow">PLANT OPERATIONS</div><h2>Production overview</h2><p>Bagging performance, conveyor activity and godown output.</p></div><div className="ops-title-actions"><button className="ops-btn" onClick={onRefresh} disabled={demo}><RefreshCw size={14}/>Refresh</button><button className="ops-btn filled" onClick={downloadReport}><Download size={14}/>Export report</button></div></div>
  {demo?<div className="ops-notice sample"><span><Factory size={15}/><strong>Sample plant data</strong> Illustrative values for design review. No live equipment is connected in this view.</span></div>:dataError?<div className="ops-notice"><span><AlertTriangle size={15}/><strong>{available?'Connection interrupted':'Waiting for production service'}</strong> {available?'Showing the last received values.':'Connect your backend to load production records.'}</span><button onClick={onRefresh}>Retry connection <ArrowRight size={13}/></button></div>:null}
  <div className="ops-metrics">
   <Metric title="Total bags counted" icon={Package} value={fmt(summary.totalBags)} unit="bags" detail={productionDelta==null?'Selected reporting period':'vs. previous day'} trend={productionDelta} series={available?hourlyProduction:[]}/>
   <Metric title="Production rate" icon={Gauge} value={fmt(summary.rate)} unit="bags/hr" detail={available?`${number(summary.perMinute)} counted in last minute`:'Awaiting production data'} series={available?hourlyProduction.slice(-8):[]} accent="#547aab"/>
   <Metric title="Conveyor status" icon={Activity} value={available?`${running} / ${belts.length}`:'—'} unit="running" detail={available?`${belts.filter(b=>b.status==='Stopped').length} stopped · ${belts.filter(b=>b.status==='Slow').length} slow`:'Awaiting source status'}/>
   <Metric title="Camera connectivity" icon={Camera} value={available?`${online} / ${cameras.length}`:'—'} unit="online" detail={available?`${cameras.length-online} offline sources`:'Awaiting camera status'}/>
  </div>
  <div className="ops-primary-grid">
   <Section title="Production trend" subtitle="Counted bag crossings over the selected period" action={<div className="ops-segment" aria-label="Chart view"><button aria-pressed={chartView==='hourly'} className={chartView==='hourly'?'selected':''} onClick={()=>setChartView('hourly')}>Hourly</button><button aria-pressed={chartView==='cumulative'} className={chartView==='cumulative'?'selected':''} onClick={()=>setChartView('cumulative')}>Cumulative</button></div>}>
    <div className="ops-chart-key"><span><i/>Selected day</span><span><i/>Previous day</span><small>BAGS</small></div>
    <div className="ops-main-chart">{chart.length?<ResponsiveContainer width="100%" height="100%"><ComposedChart data={chart} margin={{top:10,right:12,left:-18,bottom:0}}><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="var(--border)"/><XAxis dataKey="hour" axisLine={false} tickLine={false} minTickGap={18} tick={{fill:'var(--text-secondary)',fontSize:10}} dy={8}/><YAxis axisLine={false} tickLine={false} tick={{fill:'var(--text-secondary)',fontSize:10}} tickFormatter={v=>v>=1000?`${v/1000}k`:v}/><Tooltip content={<TrendTooltip/>} cursor={{fill:'var(--ops-hover)'}}/><Bar dataKey="current" name="Selected day" fill="#277e70" radius={[3,3,0,0]} maxBarSize={24} isAnimationActive={false}/><Line dataKey="previous" name="Previous day" stroke="#9eaeba" strokeWidth={1.8} strokeDasharray="4 4" dot={false} isAnimationActive={false} connectNulls={false}/></ComposedChart></ResponsiveContainer>:<Empty title="No production history" description="Hourly counts will appear as bags cross a configured counting line."/>}</div>
    <div className="ops-chart-footer"><span><Clock3 size={13}/>Peak hour <b>{available&&peakHour.bags>0?peakHour.hour:'—'}</b></span><span>{available?`${number(peakHour.bags)} bags at peak`:'Waiting for records'}</span></div>
   </Section>
   <Section title="Production target" subtitle="Combined configured godown targets" className="ops-target-panel" action={<span className="ops-small-tag">BAGS</span>}>
    <div className="ops-target-body"><div className="ops-target-ring" style={{'--completion':`${Math.min(100,progress||0)}%`}} role="img" aria-label={progress==null?'Target not configured':`${progress.toFixed(1)} percent of target`}><div><strong>{available&&progress!=null?`${progress.toFixed(1)}%`:'—'}</strong><span>of target achieved</span></div></div><div className="ops-target-totals"><div><span>Actual output</span><strong>{fmt(summary.totalBags)}</strong></div><div><span>Target output</span><strong>{totalTarget>0?number(totalTarget):'Not set'}</strong></div></div><div className="ops-target-remaining"><span>{totalTarget>0?'Bags remaining':'Target configuration'}</span><strong>{totalTarget>0?fmt(Math.max(0,totalTarget-summary.totalBags)):'Required'}</strong></div></div>
   </Section>
  </div>
  <div className="ops-secondary-grid">
   <Section title="Conveyor monitoring" subtitle="Production sources and current operating state" action={<button className="ops-link" onClick={()=>onNavigate('Belts')}>View all <ArrowRight size={14}/></button>} className="ops-conveyor-panel">
    <div className="ops-table-tools"><span><i className="ops-dot"/>{available?`${running} running sources`:'No source data'}</span><label className="ops-search"><Search size={14}/><input aria-label="Search conveyor sources" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search source..."/></label></div>
    <div className="ops-table-scroll"><table className="ops-table"><thead><tr><th>CONVEYOR / SOURCE</th><th>STATUS</th><th className="numeric">BAGS COUNTED</th><th className="numeric">RATE / HR</th><th>LAST EVENT</th></tr></thead><tbody>{sources.map(b=><tr key={b.id}><td><div className="ops-source-name"><div className="ops-source-icon"><Activity size={16}/></div><div><strong>{b.name}</strong><small>{b.id} · {b.camera||'Camera not mapped'}</small></div></div></td><td><StatePill value={b.status}/></td><td className="numeric emphasis">{number(b.bags)}</td><td className="numeric">{number(b.rate)}</td><td className="ops-muted">{b.lastEvent||'—'}</td></tr>)}</tbody></table>{!sources.length&&<Empty title={query?'No matching sources':'No conveyors reporting'} description={query?'Try another source name or camera ID.':'Connected production sources will appear here.'}/>}</div>
   </Section>
   <Section title="Attention required" subtitle="Latest alerts and source events" action={<span className={`ops-count ${openIssues.length?'warning':''}`}>{openIssues.length}</span>}>
    <div className="ops-alerts">{issues.length?issues.slice(0,3).map((a,i)=><div className={`ops-alert ${a.level}`} key={a.id||i}><div className="ops-alert-symbol">{a.level==='resolved'?<CheckCircle2 size={16}/>:<AlertTriangle size={16}/>}</div><div><strong>{a.title||a.type||'Source event'}</strong><p>{a.description||a.message||a.location}</p><span>{a.location} {a.time&&`· ${a.time}`}</span></div></div>):<Empty icon={available?CheckCircle2:Bell} title={available?'No alerts recorded':'Awaiting event feed'} description={available?'No alerts are recorded for the selected period.':'Equipment events will appear when the service is connected.'}/>}</div><button className="ops-panel-bottom-link" onClick={()=>onNavigate('Alerts')}>Open alert history <ArrowRight size={14}/></button>
   </Section>
  </div>
  <div className="ops-bottom-grid">
   <Section title="Godown output" subtitle="Bag counts and target achievement by destination" action={<button className="ops-link" onClick={()=>onNavigate('Godowns')}>All godowns <ArrowRight size={14}/></button>}>
    <div className="ops-godowns">{godowns.length?godowns.map(g=>{const pct=percent(g.bags,g.target);return <button className="ops-godown" key={g.id} onClick={()=>onGodownClick(g)}><div className="ops-godown-icon"><Warehouse size={19}/></div><div className="ops-godown-info"><strong>{g.name}<span>{number(g.bags)} <small>bags</small></span></strong><div className="ops-progress"><i style={{width:`${Math.min(100,pct||0)}%`}}/></div><small>{pct==null?'No target set':`${number(g.target)} target · ${pct.toFixed(1)}% achieved`}</small></div><ChevronRight size={15}/></button>}):<Empty icon={Warehouse} title="No godowns configured" description="Map camera sources to godowns to compare production output."/>}</div>
   </Section>
   <Section title="Recent bag crossings" subtitle="Latest counting-line events" action={<span className="ops-small-tag">{demo?'SAMPLE':'EVENT LOG'}</span>}>
    <div className="ops-table-scroll"><table className="ops-table compact"><thead><tr><th>EVENT</th><th>LOCATION</th><th className="numeric">TIME</th></tr></thead><tbody>{recentEvents.slice(0,4).map(e=><tr key={e.id}><td><span className="ops-event-icon"><Package size={13}/></span><strong>{e.bag}</strong></td><td>{e.location}</td><td className="numeric ops-muted">{e.time}</td></tr>)}</tbody></table>{!recentEvents.length&&<Empty icon={Package} title="No crossing events" description="New bag counts will appear automatically."/>}</div>
   </Section>
  </div>
  <footer className="ops-dashboard-footer"><span><span className={`ops-dot ${!available?'muted':''}`}/>{demo?'Sample environment':dataError?'Production service disconnected':available?'Production service connected':'Connecting to production service'}</span><span>{demo?'Illustrative data · For presentation only':lastUpdated?`Last received ${new Date(lastUpdated).toLocaleTimeString('en-IN')}`:'No production data received'}<span className="ops-footer-sep">/</span>Auto-refresh 2s</span></footer>
 </div>
}
