import React, { useState, useMemo, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import {
  LayoutDashboard,
  Warehouse,
  Factory,
  Activity,
  Bell,
  Settings,
  Menu,
  X,
  ShieldCheck,
  TrendingUp,
  Package,
  Gauge,
  Camera,
  ChevronRight,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  CircleOff,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  Hourglass,
  Play,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Tags,
  ImagePlus,
  Wand2,
  Save,
  ChevronLeft,
  Trash2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import "./styles.css";
import { emptyDashboard } from "./data/emptyDashboard";
import { getDashboardSummary } from "./services/api";
import ScopePage from "./components/ScopePage";

import OperationsDashboard from "./components/OperationsDashboard";
import { sampleDashboard } from "./data/sampleDashboard";
import "./professional.css";

function localDateInputValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getTimeRangeDefaults(range) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const current = `${hh}:${mm}`;

  switch (range) {
    case "last-1-hour": {
      const d = new Date(now.getTime() - 60 * 60 * 1000);
      return {
        from: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
        to: current,
      };
    }
    case "last-3-hours": {
      const d = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      return {
        from: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
        to: current,
      };
    }
    case "last-6-hours": {
      const d = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      return {
        from: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
        to: current,
      };
    }
    case "whole-day":
      return { from: "00:00", to: "23:59" };
    case "custom":
      return { from: "00:00", to: "23:59" };
    default:
      return { from: "00:00", to: "23:59" };
  }
}

function App() {
  const [filterDate, setFilterDate] = useState(localDateInputValue);
  const [timeRange, setTimeRange] = useState("whole-day");
  const [fromTime, setFromTime] = useState("00:00");
  const [toTime, setToTime] = useState("23:59");
  const [appliedFilter, setAppliedFilter] = useState(null);

  const applyFilter = () => {
    const range = timeRange === "custom"
      ? { from: fromTime, to: toTime }
      : getTimeRangeDefaults(timeRange);
    setAppliedFilter({
      date: filterDate,
      timeRange,
      from: range.from,
      to: range.to,
    });
  };

  const clearFilter = () => {
    setFilterDate(localDateInputValue());
    setTimeRange("whole-day");
    setFromTime("00:00");
    setToTime("23:59");
    setAppliedFilter(null);
  };

  const [page, setPage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedGodown, setSelectedGodown] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [dashboardData, setDashboardData] = useState(emptyDashboard);
  const [dashboardError, setDashboardError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [demo, setDemo] = useState(() => window.__SUGARMILL_PREVIEW__ === true);
  const viewData = demo ? sampleDashboard : dashboardData;
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (demo) return;
    let active = true;
    const load = async () => {
      try {
        const data = await getDashboardSummary(appliedFilter);
        if (active) {
          setDashboardData({ ...emptyDashboard, ...data, summary: {...emptyDashboard.summary, ...data.summary}, peakHour: {...emptyDashboard.peakHour, ...data.peakHour}, downtime: {...emptyDashboard.downtime, ...data.downtime} });
          setLastUpdated(Date.now());
          setDashboardError("");
        }
      } catch (error) {
        if (active) setDashboardError(error.message || "Dashboard API unavailable");
      }
    };
    load();
    const timer = window.setInterval(load, 2000);
    return () => { active = false; window.clearInterval(timer); };
  }, [refreshToken, appliedFilter, demo]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  function ThemeToggle() {
    return (
      <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle color theme">
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    );
  }

  const pages = {
    Dashboard: <OperationsDashboard demo={demo} lastUpdated={lastUpdated} onNavigate={setPage} data={viewData} dataError={dashboardError} filter={appliedFilter} onRefresh={() => setRefreshToken((v) => v + 1)} onGodownClick={setSelectedGodown} onExplore={() => setPage("Scope & Add-ons")} />,
    "Scope & Add-ons": <ScopePage onNavigate={setPage} />,
    Cameras: <><div className="page-heading"><div><h2>Camera workspace</h2><p>Connect sources, configure counting lines and test detection.</p></div></div><Panel title="Live camera" subtitle="Connection and counting configuration"><LiveCameraPanel /></Panel><Panel title="Video testing" subtitle="Validate detection using a recorded video"><VideoTestPanel /></Panel></>,
    Training: <TrainingPage />,
    Godowns: <Godowns data={viewData} onGodownClick={setSelectedGodown} />,
    Production: <Production data={viewData} />,
    Belts: <Belts data={viewData} />,
    Alerts: <Alerts data={viewData} />,
    Settings: <SettingsPage apiError={dashboardError} apiReady={Boolean(dashboardData.generatedAt)} />,
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><Factory size={23} strokeWidth={1.6}/></div>
          <div>
            <strong>Sugar Mill</strong>
            <span>OPERATIONS PLATFORM</span>
          </div>
          <button
            aria-label="Close navigation" className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Main navigation"><div className="nav-caption">OPERATIONS</div>
          {[
            ["Dashboard", LayoutDashboard],
            ["Cameras", Camera],
            ["Godowns", Warehouse],
            ["Production", Factory],
            ["Belts", Activity],
            ["Alerts", Bell],
            ["Training", Tags],
            ["Scope & Add-ons", ShieldCheck],
            ["Settings", Settings],
          ].map(([name, Icon]) => (
            <button
              key={name}
              aria-current={page === name ? "page" : undefined}
              className={`nav-item ${page === name ? "active" : ""} ${name === "Training" ? "nav-section-start" : ""}`}
              onClick={() => {
                setPage(name);
                setSidebarOpen(false);
              }}
            >
              <Icon size={19} />
              <span>{{Dashboard:"Overview",Belts:"Conveyors",Production:"Production reports",Training:"Model training","Scope & Add-ons":"Capabilities"}[name] || name}</span>{name === "Alerts" && viewData.alerts?.some(a=>a.level!=="resolved") && <b className="nav-alert-count">{viewData.alerts.filter(a=>a.level!=="resolved").length}</b>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-badge">
            <ShieldCheck size={18} />
            <div>
              <strong>Plant workspace</strong>
              <small>Local deployment</small>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="main">
        <header className="topbar">
          <button aria-label="Open navigation" className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div>
            <div className="ops-breadcrumb"><span>Workspace</span><ChevronRight size={13}/><h1>{page === "Dashboard" ? "Overview" : page}</h1></div>
            <p>{page === "Scope & Add-ons" ? "Platform capabilities & future possibilities" : "Production monitoring & control"}</p>
          </div>
          <div className="topbar-right">
            <ThemeToggle />
            <button className={`sample-toggle ${demo ? "active" : ""}`} onClick={() => setDemo(value => !value)} aria-pressed={demo}><span className="toggle-track"><i/></span>{demo ? "Sample data" : "Preview sample data"}</button>
            <span className={`header-service ${!demo && dashboardError ? "disconnected" : ""}`}><i/>{demo ? "Preview mode" : dashboardError ? "Service offline" : lastUpdated ? "Live data" : "Connecting"}</span>
            <div className="avatar" title="Operations workspace">OP</div>
          </div>
        </header>
        <div className="ops-context-bar"><div className="ops-context-plant"><div><Factory size={18}/></div><span><strong>Sugar Mill</strong><small>Packaging & storage operations</small></span></div><div className="ops-context-right"><span className="context-label">REPORTING WINDOW</span><fieldset className="ops-report-filters" disabled={demo}><label><span className="sr-only">Report date</span><input aria-label="Report date" type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)}/></label><label><span className="sr-only">Time range</span><select aria-label="Time range" value={timeRange} onChange={e=>{setTimeRange(e.target.value);if(e.target.value!=="custom"){const range=getTimeRangeDefaults(e.target.value);setFromTime(range.from);setToTime(range.to);}}}><option value="whole-day">Whole day</option><option value="last-1-hour">Last hour</option><option value="last-3-hours">Last 3 hours</option><option value="last-6-hours">Last 6 hours</option><option value="custom">Custom range</option></select></label>{timeRange === "custom" && <><input aria-label="From time" type="time" value={fromTime} onChange={e=>setFromTime(e.target.value)}/><input aria-label="To time" type="time" value={toTime} onChange={e=>setToTime(e.target.value)}/></>}<button onClick={applyFilter}>Apply</button>{appliedFilter&&<button className="filter-reset" onClick={clearFilter} aria-label="Clear reporting filter"><X size={14}/></button>}</fieldset></div></div>
        {appliedFilter && !demo && <div className="ops-applied-window">Showing {appliedFilter.date} · {appliedFilter.from} – {appliedFilter.to}</div>}
        <section className="content">{demo && page !== "Dashboard" && <div className="ops-notice sample"><span><strong>Sample data mode.</strong> Reports show illustrative values. Camera and training controls still require your live backend.</span></div>}{pages[page]}</section>
      </main>

      {selectedGodown && (
        <GodownModal godown={selectedGodown} onClose={() => setSelectedGodown(null)} />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-icon">
          <Icon size={20} />
        </div>
        {trend && <span className="trend">{trend}</span>}
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

function LiveCameraPanel() {
  const [rtspUrl, setRtspUrl] = useState("");
  const [cameraStatus, setCameraStatus] = useState({ connected: false, count: 0, fps: 0, detections: 0, error: "" });
  const [streamKey, setStreamKey] = useState(0);
  const [line, setLine] = useState(null);
  const [draftLine, setDraftLine] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [message, setMessage] = useState("");
  const imageRef = useRef(null);
  const draftLineRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/status");
        const data = await response.json();
        if (!active) return;
        setCameraStatus(data);
        setLine(Array.isArray(data.line) ? data.line : null);
        if (data.state === "connecting" || data.state === "loading_model") {
          setMessage(data.error || "Connecting to camera...");
        } else if (data.state === "error") {
          setMessage(data.error || "Camera connection failed.");
        } else if (data.state === "live") {
          setMessage((previous) => previous.startsWith("Connecting") || previous.startsWith("Camera connected;") ? "" : previous);
        }
      } catch {
        if (active) {
          setCameraStatus((prev) => ({ ...prev, connected: false, state: "error", error: "Detection service is not running" }));
          setMessage("Detection service is not running. Start the backend API and try again.");
        }
      }
    };
    refresh();
    const timer = window.setInterval(refresh, 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const connect = async (e) => {
    e.preventDefault();
    setMessage("Connecting to camera...");
    try {
      const response = await fetch("/api/camera/connect", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rtsp_url: rtspUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not connect to camera");
      setMessage("Connecting to camera...");
      setStreamKey((key) => key + 1);
    } catch (error) { setMessage(error.message); }
  };

  const disconnect = async () => {
    await fetch("/api/camera/disconnect", { method: "POST" }).catch(() => {});
    drawingRef.current = false;
    draftLineRef.current = null;
    setDrawing(false);
    setDraftLine(null);
    setCameraStatus((prev) => ({ ...prev, connected: false, state: "disconnected" }));
    setMessage("");
  };

  const pointFromEvent = (event, clamp = false) => {
    const image = imageRef.current;
    if (!image || !image.naturalWidth || !image.naturalHeight) return null;
    const rect = image.getBoundingClientRect();
    const scale = Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const left = rect.left + (rect.width - width) / 2;
    const top = rect.top + (rect.height - height) / 2;
    let x = (event.clientX - left) / width;
    let y = (event.clientY - top) / height;
    if (!clamp && (x < 0 || x > 1 || y < 0 || y > 1)) return null;
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));
    return [x, y];
  };
  const beginLine = (event) => {
    if (!drawingRef.current) return;
    const point = pointFromEvent(event);
    if (!point) return;
    const [x, y] = point;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const draft = [x, y, x, y];
    draftLineRef.current = draft;
    setDraftLine(draft);
  };
  const moveLine = (event) => {
    if (!draftLineRef.current) return;
    const point = pointFromEvent(event, true);
    if (!point) return;
    const draft = [draftLineRef.current[0], draftLineRef.current[1], point[0], point[1]];
    draftLineRef.current = draft;
    setDraftLine(draft);
  };
  const finishLine = async (event) => {
    const draft = draftLineRef.current;
    if (!draft) return;
    const point = pointFromEvent(event, true);
    if (!point) return;
    const nextLine = [draft[0], draft[1], point[0], point[1]];
    const image = imageRef.current;
    const rect = image?.getBoundingClientRect();
    if (rect && Math.hypot((nextLine[2] - nextLine[0]) * rect.width,
      (nextLine[3] - nextLine[1]) * rect.height) < 12) {
      draftLineRef.current = null;
      setDraftLine(null);
      setMessage("Drag farther across the video to place a counting line.");
      return;
    }
    draftLineRef.current = null;
    setDraftLine(null);
    try {
      const response = await fetch("/api/camera/line", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x1: nextLine[0], y1: nextLine[1], x2: nextLine[2], y2: nextLine[3] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not save counting line");
      setLine(nextLine);
      drawingRef.current = false;
      setDrawing(false);
      setMessage("Counting line saved. Each tracked bag is counted once when it crosses the line.");
    } catch (error) {
      setDrawing(true);
      drawingRef.current = true;
      setMessage(error.message);
    }
  };

  const cancelLine = () => {
    draftLineRef.current = null;
    setDraftLine(null);
    setMessage("Line placement cancelled. Try dragging again.");
  };

  const toggleDrawing = () => {
    const next = !drawingRef.current;
    drawingRef.current = next;
    setDrawing(next);
    draftLineRef.current = null;
    setDraftLine(null);
    setMessage(next ? "Drag from one side of the conveyor to the other." : "Line drawing cancelled.");
  };

  const clearLine = async () => {
    try {
      const response = await fetch("/api/camera/line", { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not clear counting line");
      setLine(null);
      setMessage("Counting line cleared. Counting is paused until you add a new line.");
    } catch (error) { setMessage(error.message); }
  };

  const visibleLine = draftLine || line;
  const feedStarting = cameraStatus.state === "connecting" || cameraStatus.state === "loading_model";
  const statusLabel = cameraStatus.connected ? "LIVE" : feedStarting ? "CONNECTING" : cameraStatus.error ? "OFFLINE" : "DISCONNECTED";
  return (
    <Panel title="Live Camera Feed" subtitle="RTSP camera with YOLO detections and line-crossing count">
      <form className="camera-connect-form" onSubmit={connect}>
        <input aria-label="RTSP camera URL" type="text" autoComplete="off" autoCapitalize="off" spellCheck="false" placeholder="RTSP URL (rtsp://user:password@camera/stream)" value={rtspUrl} onChange={(e) => setRtspUrl(e.target.value)} required />
        {cameraStatus.connected || feedStarting
          ? <button className="secondary-btn" type="button" onClick={disconnect}>Disconnect</button>
          : <button className="primary-btn" type="submit">Connect camera</button>}
        <a className="secondary-btn csv-download" href="/api/events.csv" download>Download CSV</a>
      </form>
      <div className="camera-live-stats">
        <span className={cameraStatus.connected ? "live-status online" : "live-status offline"}><i />{statusLabel}</span>
        <span><strong>{cameraStatus.count || 0}</strong> bags counted</span>
        <span><strong>{cameraStatus.detections || 0}</strong> in frame</span>
        <span><strong>{cameraStatus.fps || 0}</strong> FPS</span>
      </div>
      <div className="camera-line-tools">
        <button className="secondary-btn" type="button" disabled={!cameraStatus.connected} onClick={toggleDrawing}>
          {drawing ? "Cancel drawing" : line ? "Redraw line" : "Add counting line"}
        </button>
        {line && !drawing && <button className="text-button" type="button" onClick={clearLine}>Clear line</button>}
        <span>{drawing ? "Drag across the feed to place your counting line." : line ? "Line is active; bags crossing it are counted once." : "No line set. Counting is paused."}</span>
      </div>
      <div className={`camera-feed-frame ${drawing ? "drawing-line" : ""}`}>
        {cameraStatus.connected || feedStarting
          ? <div className="camera-video-canvas" onPointerDown={cameraStatus.connected && drawing ? beginLine : undefined} onPointerMove={moveLine} onPointerUp={finishLine} onPointerCancel={cancelLine}>
              <img ref={imageRef} key={streamKey} draggable="false" src={`/api/camera/stream.mjpg?session=${streamKey}`} alt="Live RTSP stream with model detections" onError={() => setMessage("Live video stream failed. Check the backend status and camera connection.")} />
              {visibleLine && <svg className={`counting-line-overlay ${draftLine ? "preview" : ""}`} viewBox="0 0 1 1" preserveAspectRatio="none"><line x1={visibleLine[0]} y1={visibleLine[1]} x2={visibleLine[2]} y2={visibleLine[3]} /></svg>}
            </div>
          : <div className="camera-feed-empty"><Camera size={36} /><strong>Camera feed will appear here</strong><span>Enter the RTSP URL and connect to start live detection.</span></div>}
        <span className={`feed-live-badge ${cameraStatus.connected ? "on" : ""}`}><i />{statusLabel}</span>
      </div>
      <div className="camera-feed-footer"><span>Enable “Add counting line”, then drag on the video.</span><span>Counts are saved to CSV after a tracked bag crosses your line.</span></div>
      {(message || cameraStatus.error) && <p className="camera-feed-message">{message || cameraStatus.error}</p>}
    </Panel>
  );
}

function VideoTestPanel() {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoName, setVideoName] = useState("");
  const [boxes, setBoxes] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(false);
  const versionRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (timerRef.current) window.clearInterval(timerRef.current);
  }, [videoUrl]);

  useEffect(() => {
    let frameId;
    const paint = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.videoWidth && video.videoHeight) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = Math.max(2, canvas.width / 400);
        ctx.font = `bold ${Math.max(14, canvas.width / 55)}px sans-serif`;
        boxes.forEach((box) => {
          const x = box.x1 * canvas.width, y = box.y1 * canvas.height;
          const width = (box.x2 - box.x1) * canvas.width, height = (box.y2 - box.y1) * canvas.height;
          const label = `${box.label} ${(box.confidence * 100).toFixed(0)}%`;
          ctx.strokeStyle = "#22c55e";
          ctx.fillStyle = "#22c55e";
          ctx.strokeRect(x, y, width, height);
          const labelWidth = ctx.measureText(label).width + 12;
          ctx.fillRect(x, Math.max(0, y - 26), labelWidth, 26);
          ctx.fillStyle = "#07120a";
          ctx.fillText(label, x + 6, Math.max(18, y - 7));
        });
      }
      frameId = requestAnimationFrame(paint);
    };
    frameId = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(frameId);
  }, [boxes]);

  const chooseVideo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    versionRef.current += 1;
    setVideoUrl(URL.createObjectURL(file));
    setVideoName(file.name);
    setBoxes([]);
    setMessage("Play the video to run the active model on its frames.");
  };

  const inferFrame = async (force = false) => {
    const video = videoRef.current;
    if (!video || (!force && (video.paused || video.ended)) || video.readyState < 2 || requestRef.current) return;
    requestRef.current = true;
    const version = versionRef.current;
    const scale = Math.min(1, 960 / video.videoWidth);
    const frame = document.createElement("canvas");
    frame.width = Math.max(1, Math.round(video.videoWidth * scale));
    frame.height = Math.max(1, Math.round(video.videoHeight * scale));
    frame.getContext("2d").drawImage(video, 0, 0, frame.width, frame.height);
    try {
      const blob = await new Promise((resolve) => frame.toBlob(resolve, "image/jpeg", 0.82));
      if (!blob) throw new Error("Could not capture the current video frame.");
      const response = await fetch("/api/video-test/infer", { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: blob });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Video frame inference failed");
      if (version === versionRef.current) {
        setBoxes(data.boxes || []);
        setMessage(`${data.detections || 0} object${data.detections === 1 ? "" : "s"} detected in the latest frame.`);
      }
    } catch (error) {
      if (version === versionRef.current) setMessage(error.message);
    } finally { requestRef.current = false; }
  };
  const startTesting = () => {
    setBusy(true);
    inferFrame();
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(inferFrame, 450);
  };
  const stopTesting = () => {
    setBusy(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  return (
    <Panel title="Test a Video" subtitle="Play a local video and see the active YOLO model's detections as it runs">
      <div className="video-test-controls">
        <label className="secondary-btn training-upload"><Play size={16} /> Choose video<input type="file" accept="video/*" onChange={chooseVideo} /></label>
        {videoName && <span className="video-test-filename" title={videoName}>{videoName}</span>}
        <span className="video-test-count">{boxes.length} detected in latest frame</span>
      </div>
      {videoUrl ? <div className="video-test-frame">
        <video ref={videoRef} key={videoUrl} src={videoUrl} controls playsInline onPlay={startTesting} onPause={stopTesting} onEnded={stopTesting} />
        <canvas ref={canvasRef} aria-hidden="true" />
        {busy && <span className="feed-live-badge on"><i />TESTING</span>}
      </div> : <div className="camera-feed-empty video-test-empty"><Play size={32} /><strong>Choose a video to start</strong><span>Your video stays in this browser; frames are sent to the local detector for testing.</span></div>}
      {videoUrl && <div className="video-test-actions"><button className="secondary-btn" type="button" onClick={() => inferFrame(true)} disabled={!videoRef.current || videoRef.current.readyState < 2}>Test current frame</button><span>Detections are shown on the video while it plays.</span></div>}
      {message && <p className="camera-feed-message">{message}</p>}
    </Panel>
  );
}


function Godowns({ data, onGodownClick }) {
  const { godowns } = data;
  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Godown Monitoring</h2>
          <p>Production performance by storage area.</p>
        </div>
      </div>
      <div className="godown-cards">
        {godowns.length === 0 && <div className="empty-data-state">No camera-to-godown mapping is configured. Live counts are available under the camera source.</div>}
        {godowns.map((g) => (
          <div
            className="large-godown clickable"
            key={g.id}
            onClick={() => onGodownClick(g)}
          >
            <div className="large-godown-head">
              <div className="warehouse-symbol">
                <Warehouse size={25} />
              </div>
              <div>
                <h3>{g.name}</h3>
                <span>{g.belts} conveyor belts</span>
              </div>
              <span className="live-pill">LIVE</span>
            </div>
            <div className="large-number">
              {g.bags.toLocaleString()} <small>bags today</small>
            </div>
            <div className="godown-metrics">
              <div>
                <span>Rate</span>
                <strong>{g.rate}/hr</strong>
              </div>
              <div>
                <span>Target</span>
                <strong>{g.target.toLocaleString()}</strong>
              </div>
              <div>
                <span>Achievement</span>
                <strong>{Math.round((g.bags / g.target) * 100)}%</strong>
              </div>
            </div>
            <div className="progress large">
              <span
                style={{
                  width: `${Math.min(100, (g.bags / g.target) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function GodownModal({ godown, onClose }) {
  if (!godown) return null;
  const pct = Math.min(100, Math.round((godown.bags / godown.target) * 100));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">
            <Warehouse size={22} />
            <h3>{godown.name}</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-metric">
            <span>Total Bags</span>
            <strong>{godown.bags.toLocaleString()}</strong>
          </div>
          <div className="modal-metric">
            <span>Target</span>
            <strong>{godown.target.toLocaleString()}</strong>
          </div>
          <div className="modal-metric">
            <span>Achievement</span>
            <strong>{pct}%</strong>
          </div>
          <div className="modal-metric">
            <span>Rate</span>
            <strong>{godown.rate}/hr</strong>
          </div>
          <div className="modal-metric">
            <span>Conveyor Belts</span>
            <strong>{godown.belts}</strong>
          </div>
          <div className="progress large modal-progress">
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Production({ data }) {
  const { hourlyProduction, dailyProduction, allTimeProduction, summary, cameras } = data;
  const [view, setView] = useState("daily");

  const getChartData = () => {
    switch (view) {
      case "hourly":
        return hourlyProduction;
      case "all-time":
        return allTimeProduction;
      default:
        return dailyProduction;
    }
  };

  const getXKey = () => (view === "hourly" ? "hour" : "day");

  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Production Analytics</h2>
          <p>Production trends calculated from recorded camera crossings.</p>
        </div>
        <div className="view-tabs">
          <button
            className={`view-tab ${view === "daily" ? "active" : ""}`}
            onClick={() => setView("daily")}
          >
            Daily
          </button>
          <button
            className={`view-tab ${view === "hourly" ? "active" : ""}`}
            onClick={() => setView("hourly")}
          >
            Hourly
          </button>
          <button
            className={`view-tab ${view === "all-time" ? "active" : ""}`}
            onClick={() => setView("all-time")}
          >
            All-Time
          </button>
        </div>
      </div>
      <Panel title="Production Trend" subtitle="Historical bag crossings stored in CSV">
        <div className="chart-wrap tall">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={getXKey()} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bags" name="Bags" radius={[5, 5, 0, 0]} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <div className="stats-grid compact">
        <StatCard
          icon={Package}
          label="Selected Period Production"
          value={summary.totalBags.toLocaleString()}
          sub="bags"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Recorded Day"
          value={(dailyProduction.length ? Math.round(dailyProduction.reduce((sum, row) => sum + row.bags, 0) / dailyProduction.length) : 0).toLocaleString()}
          sub="bags/day"
        />
        <StatCard
          icon={Gauge}
          label="Peak Rate"
          value={`${Math.max(0, ...hourlyProduction.map((row) => row.bags)).toLocaleString()}/hr`}
          sub="highest recorded hour in selected period"
        />
        <StatCard
          icon={Factory}
          label="Connected Cameras"
          value={`${cameras.filter((camera) => camera.status === "Online").length}/${cameras.length}`}
          sub="real camera status"
        />
      </div>
    </>
  );
}

function Belts({ data }) {
  const { belts } = data;
  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Conveyor Belt Monitoring</h2>
          <p>Camera sources and belt counts recorded in CSV.</p>
        </div>
      </div>
      <div className="belt-grid">
        {belts.length === 0 && <div className="empty-data-state">No camera events are recorded yet.</div>}
        {belts.map((b) => (
          <div className="belt-card" key={b.id}>
            <div className="belt-head">
              <div>
                <span className="belt-id">{b.id}</span>
                <h3>{b.name}</h3>
              </div>
              <Status status={b.status} />
            </div>
            <div className="belt-count">
              {b.bags.toLocaleString()} <small>bags in selected period</small>
            </div>
            <div className="belt-info">
              <span>
                <Gauge size={15} /> {b.rate}/hr
              </span>
              <span>
                <Camera size={15} /> {b.camera}
              </span>
            </div>
            <div className="belt-footer">
              <span>Last event {b.lastEvent}</span>
              <span className={b.status === "Running" ? "green" : "red"}>
                {b.status === "Running" ? "Operational" : b.status === "Slow" ? "Slow" : "Needs attention"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Alerts({ data }) {
  const { alerts } = data;
  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Alerts & Events</h2>
          <p>Camera status events read from the event CSV.</p>
        </div>
      </div>
      <div className="alert-summary">
        <div>
          <strong>{alerts.filter((a) => a.level === "warning").length}</strong>
          <span>Warnings</span>
        </div>
        <div>
          <strong>{alerts.filter((a) => a.level === "critical").length}</strong>
          <span>Critical</span>
        </div>
        <div>
          <strong>{alerts.filter((a) => a.level === "resolved").length}</strong>
          <span>Resolved</span>
        </div>
      </div>
      <div className="alert-list">
        {alerts.length === 0 && <div className="empty-data-state">No camera alerts have been recorded in the CSV yet.</div>}
        {alerts.map((a) => (
          <div className={`alert-card ${a.level}`} key={a.id}>
            <div className="alert-icon">
              {a.level === "critical" ? (
                <AlertTriangle size={20} />
              ) : a.level === "resolved" ? (
                <CheckCircle2 size={20} />
              ) : (
                <Bell size={20} />
              )}
            </div>
            <div className="alert-content">
              <strong>{a.title}</strong>
              <p>{a.description}</p>
              <small>
                {a.time} • {a.location}
              </small>
            </div>
            <span className="alert-level">{a.level}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function TrainingPage() {
  const [project, setProject] = useState({ classes: ["bag"], items: [], job: { state: "idle" } });
  const [classText, setClassText] = useState("bag");
  const [selected, setSelected] = useState(0);
  const [boxes, setBoxes] = useState([]);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const imageRef = useRef(null);
  const fileRef = useRef(null);
  const terminalJobRef = useRef("");
  const selectedItem = project.items[selected] || null;
  const manualCount = project.items.filter((item) => item.state === "reviewed" && item.source === "manual").length;
  const reviewCount = project.items.filter((item) => item.state === "needs_review").length;
  const pendingCount = project.items.filter((item) => item.state === "unlabeled").length;
  const readyCount = project.items.filter((item) => item.state === "reviewed" || item.state === "needs_review").length;
  const queueStart = Math.max(0, Math.min(selected - 10, Math.max(0, project.items.length - 40)));
  const visibleQueue = project.items.slice(queueStart, queueStart + 40);
  const job = project.job || { state: "idle" };
  const jobRunning = ["preparing", "auto_labeling", "training", "evaluating"].includes(job.state);
  const trainingBlockReason = !project.items.length
    ? "Upload photos first."
    : manualCount < 10
      ? `Save at least 10 manual seed labels first (${manualCount}/10).`
      : pendingCount > 0
        ? `Auto-label the remaining ${pendingCount} photo${pendingCount === 1 ? "" : "s"}.`
        : jobRunning
          ? `A ${job.state.replaceAll("_", " ")} job is already running.`
          : reviewCount > 0
            ? `${reviewCount} auto-label suggestions are ready to train as-is; review is optional.`
            : "Dataset is ready to train.";
  // Auto-label suggestions can be used as-is; reviewing them is optional.
  const trainingReady = !jobRunning && project.items.length > 0 && manualCount >= 10 && pendingCount === 0;

  const loadProject = async () => {
    const response = await fetch("/api/training/project");
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Could not load dataset");
    setProject(data);
    setClassText((data.classes || ["bag"]).join(", "));
    setBoxes(data.items?.[selected]?.boxes || []);
  };

  useEffect(() => {
    loadProject().catch((error) => setMessage(error.message));
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch("/api/training/job");
        const jobState = await response.json();
        setProject((prev) => ({ ...prev, job: jobState }));
        if (!["complete", "failed"].includes(jobState.state)) terminalJobRef.current = "";
        if (["complete", "failed"].includes(jobState.state) && terminalJobRef.current !== `${jobState.state}:${jobState.message}`) {
          terminalJobRef.current = `${jobState.state}:${jobState.message}`;
          const result = await fetch("/api/training/project").then((res) => res.json());
          setProject({ ...result, job: jobState });
        }
      } catch { /* Keep the last visible job state if the API briefly disconnects. */ }
    }, 1500);
    return () => window.clearInterval(timer);
  }, []);

  const selectItem = (index) => {
    const next = project.items[index];
    setSelected(index);
    setBoxes(next?.boxes || []);
    setDraft(null);
  };

  const uploadPhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setBusy(true);
    setMessage(`Uploading 0 of ${files.length} photos...`);
    let added = 0;
    try {
      for (let offset = 0; offset < files.length; offset += 4) {
        const batch = files.slice(offset, offset + 4);
        const results = await Promise.all(batch.map(async (file) => {
          const response = await fetch("/api/training/images", {
            method: "POST",
            headers: { "Content-Type": file.type || "application/octet-stream", "X-Filename": encodeURIComponent(file.name) },
            body: file,
          });
          const data = await response.json();
          if (!response.ok) throw new Error(`${file.name}: ${data.detail || "Upload failed"}`);
          return data;
        }));
        added += results.filter((result) => result.added).length;
        setMessage(`Uploading ${Math.min(offset + batch.length, files.length)} of ${files.length} photos...`);
      }
      await loadProject();
      setMessage(`${added} new photos added. ${files.length - added} duplicates skipped.`);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const saveClasses = async () => {
    const classes = classText.split(",").map((name) => name.trim()).filter(Boolean);
    try {
      const response = await fetch("/api/training/classes", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not save classes");
      await loadProject();
      setMessage("Class list saved.");
    } catch (error) { setMessage(error.message); }
  };

  const captureLivePhoto = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/training/capture-live", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not capture live frame");
      const projectResponse = await fetch("/api/training/project");
      const nextProject = await projectResponse.json();
      const index = nextProject.items.findIndex((item) => item.filename === data.item?.filename);
      setProject(nextProject);
      if (index >= 0) {
        setSelected(index);
        setBoxes([]);
      }
      setMessage("Raw live frame added to the photo queue. Label it or include it in auto-label review.");
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };

  const pointFromEvent = (event) => {
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return [Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))];
  };
  const beginBox = (event) => {
    if (!selectedItem || busy || jobRunning) return;
    const point = pointFromEvent(event);
    if (!point) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraft({ x1: point[0], y1: point[1], x2: point[0], y2: point[1] });
  };
  const moveBox = (event) => {
    if (!draft) return;
    const point = pointFromEvent(event);
    if (point) setDraft((old) => ({ ...old, x2: point[0], y2: point[1] }));
  };
  const endBox = (event) => {
    if (!draft) return;
    const point = pointFromEvent(event);
    if (point) {
      const box = { class_id: 0, x1: Math.min(draft.x1, point[0]), y1: Math.min(draft.y1, point[1]),
        x2: Math.max(draft.x1, point[0]), y2: Math.max(draft.y1, point[1]) };
      if (box.x2 - box.x1 > 0.004 && box.y2 - box.y1 > 0.004) setBoxes((old) => [...old, box]);
    }
    setDraft(null);
  };

  const saveLabels = async (andNext = false) => {
    if (!selectedItem) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/training/images/${encodeURIComponent(selectedItem.filename)}/labels`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ boxes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not save labels");
      await loadProject();
      if (andNext && selected < project.items.length - 1) selectItem(selected + 1);
      setMessage("Labels saved. This photo is marked reviewed.");
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };

  const runAutoLabel = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/training/auto-label", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not start auto-labeling");
      await loadProject();
      setMessage("Auto-labeling started. Suggestions will appear in the review queue.");
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };

  const runTraining = async () => {
    setBusy(true);
    setMessage("Starting training and preparing the dataset...");
    try {
      const response = await fetch("/api/training/train", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not start training");
      setMessage(`${data.message || "Training started"}. Progress will appear in Training status.`);
      const jobResponse = await fetch("/api/training/job");
      if (jobResponse.ok) {
        const jobState = await jobResponse.json();
        setProject((prev) => ({ ...prev, job: jobState }));
      }
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };

  const nextPhotoToReview = () => {
    if (!project.items.length) return;
    const next = project.items.findIndex((item, index) => index > selected && item.state === "needs_review");
    const wrapped = next >= 0 ? next : project.items.findIndex((item) => item.state === "needs_review");
    if (wrapped >= 0) selectItem(wrapped);
  };

  const applyModelToCamera = async () => {
    try {
      const response = await fetch("/api/camera/reload-model", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Connect the camera first");
      setMessage("Camera is reconnecting with the newly trained model.");
    } catch (error) { setMessage(error.message); }
  };

  return (
    <div className="training-page">
      <div className="page-heading">
        <div><h2>Model Training</h2><p>Label a small seed set, review suggested boxes, then fine-tune the live detector.</p></div>
      </div>
      <div className="training-steps">
        <div><b>1</b><span><strong>Upload photos</strong><small>Add your image collection</small></span></div>
        <div><b>2</b><span><strong>Label 10 photos</strong><small>Draw boxes and choose classes</small></span></div>
        <div><b>3</b><span><strong>Review suggestions</strong><small>Correct auto-labels before training</small></span></div>
        <div><b>4</b><span><strong>Train and use</strong><small>Save best.pt for RTSP detection</small></span></div>
      </div>
      <div className="training-summary">
        <div><strong>{project.items.length}</strong><span>Photos uploaded</span></div>
        <div><strong>{manualCount}</strong><span>Manual seed labels</span></div>
        <div><strong>{reviewCount}</strong><span>Need review</span></div>
        <div><strong>{readyCount}</strong><span>Ready for training</span></div>
      </div>
      <Panel title="1. Upload photos and set classes" subtitle="Duplicate photos are skipped. One image can contain several labeled objects, or no objects.">
        <div className="training-controls">
          <label className="secondary-btn training-upload"><ImagePlus size={17} /> Choose photos<input ref={fileRef} type="file" accept="image/*" multiple onChange={uploadPhotos} disabled={busy || jobRunning} /></label>
          <button className="secondary-btn" type="button" onClick={captureLivePhoto} disabled={busy || jobRunning}><Camera size={16} /> Capture live frame</button>
          <label className="training-class-field"><span>Object classes (comma separated)</span><input value={classText} onChange={(event) => setClassText(event.target.value)} placeholder="bag" disabled={manualCount > 0} /></label>
          <button className="secondary-btn" type="button" onClick={saveClasses} disabled={busy || manualCount > 0}>Save classes</button>
        </div>
        <p className="training-hint">Start with the 10–15 representative photos you label yourself. Class names must match the model you want to train.</p>
      </Panel>
      <Panel title="2. Label seed photos and review auto-labels" subtitle="Drag on the image to draw a box. Save a photo only after checking every object.">
        {project.items.length === 0 ? <div className="training-empty">Upload photos to begin labeling.</div> : <div className="training-workspace">
          <div className="training-review-list">
            <div className="training-review-head"><strong>Photo queue</strong><span>{selected + 1} / {project.items.length}</span></div>
            {visibleQueue.map((item, offset) => { const index = queueStart + offset; return <button key={item.filename} type="button" className={`training-photo-row ${selected === index ? "active" : ""}`} onClick={() => selectItem(index)}>
              <img src={item.url} alt="" /><span><strong>{item.original_name}</strong><small>{item.state === "needs_review" ? "Review suggestion" : item.state === "reviewed" ? (item.source === "manual" ? "Manual label saved" : "Reviewed and saved") : "Needs label"}</small></span>
              <i className={`training-state ${item.state}`} />
            </button>; })}
          </div>
          <div className="training-annotator">
            {selectedItem && <>
              <div className="training-image-title"><strong>{selectedItem.original_name}</strong><span>{selectedItem.state === "needs_review" ? "Auto-label suggestion — review it" : selectedItem.state === "reviewed" ? "Reviewed" : "Manual labeling"}</span></div>
              <div className="training-image-stage" onPointerDown={beginBox} onPointerMove={moveBox} onPointerUp={endBox} onPointerCancel={() => setDraft(null)}>
                <img ref={imageRef} src={selectedItem.url} alt={selectedItem.original_name} draggable="false" />
                <svg viewBox="0 0 1 1" preserveAspectRatio="none">
                  {boxes.map((box, index) => <g key={index}>
                    <rect x={box.x1} y={box.y1} width={box.x2 - box.x1} height={box.y2 - box.y1} />
                    <text x={box.x1} y={Math.max(0.025, box.y1)}>{project.classes[box.class_id] || "object"}</text>
                  </g>)}
                  {draft && <rect className="draft" x={Math.min(draft.x1, draft.x2)} y={Math.min(draft.y1, draft.y2)} width={Math.abs(draft.x2 - draft.x1)} height={Math.abs(draft.y2 - draft.y1)} />}
                </svg>
              </div>
              <div className="training-box-list">
                {boxes.map((box, index) => <div key={index}><span>Box {index + 1}</span><select value={box.class_id} onChange={(event) => setBoxes((old) => old.map((row, i) => i === index ? { ...row, class_id: Number(event.target.value) } : row))}>{project.classes.map((name, classIndex) => <option key={name} value={classIndex}>{name}</option>)}</select><button type="button" aria-label={`Remove box ${index + 1}`} onClick={() => setBoxes((old) => old.filter((_, i) => i !== index))}><Trash2 size={15} /></button></div>)}
                {boxes.length === 0 && <small>No objects labeled. Save this only if the photo truly contains none.</small>}
              </div>
              <div className="training-annotator-actions">
                <button className="secondary-btn" type="button" disabled={selected === 0} onClick={() => selectItem(selected - 1)}><ChevronLeft size={16} /> Previous</button>
                <button className="primary-btn" type="button" disabled={busy || jobRunning} onClick={() => saveLabels(true)}><Save size={16} /> Save and next</button>
                <button className="secondary-btn" type="button" disabled={selected >= project.items.length - 1} onClick={() => selectItem(selected + 1)}>Next <ChevronRight size={16} /></button>
              </div>
            </>}
          </div>
        </div>}
        <div className="training-controls training-actions">
          <button className="secondary-btn" type="button" onClick={nextPhotoToReview} disabled={!reviewCount || jobRunning}>Next photo to review</button>
          <button className="secondary-btn" type="button" onClick={runAutoLabel} disabled={busy || jobRunning || manualCount < 10 || pendingCount === 0}><Wand2 size={17} /> Auto-label remaining ({pendingCount})</button>
          <button className="primary-btn" type="button" onClick={runTraining} disabled={busy || !trainingReady}><Play size={16} /> {busy && message.startsWith("Starting training") ? "Starting training..." : reviewCount ? "Train with auto-labels" : "Train model"}</button>
        </div>
        <p className={`training-readiness ${trainingReady ? "ready" : "blocked"}`} role="status">{trainingBlockReason}</p>
        <p className="training-hint">Auto-label suggestions use the current active YOLO model. Review is optional; corrected and saved labels are usually more reliable than untouched suggestions.</p>
      </Panel>
      <Panel title="Training status" subtitle="Training uses a reproducible 70/20/10 train, validation, and test split.">
        <div className={`training-job-state ${job.state}`}><span className="training-state-dot" /><div><strong>{job.state === "idle" ? "Ready when you are" : job.state.replaceAll("_", " ")}</strong><small>{job.message || "Upload and label a dataset to start."}</small></div></div>
        {job.error && <p className="training-error">{job.error}</p>}
        {job.result?.split && <div className="training-result"><span>Train: {job.result.split.train}</span><span>Validation: {job.result.split.val}</span><span>Test: {job.result.split.test}</span></div>}
        {job.result?.best_pt && <div className="training-result training-model-result"><strong>best.pt</strong><code>{job.result.best_pt}</code><button className="secondary-btn" type="button" onClick={applyModelToCamera}>Apply to connected RTSP camera</button></div>}
        {job.result?.test_metrics && <div className="training-result">{Object.entries(job.result.test_metrics).map(([key, value]) => <span key={key}>{key}: {Number(value).toFixed(3)}</span>)}</div>}
      </Panel>
      {message && <p className="training-message" role="status">{message}</p>}
    </div>
  );
}

function SettingsPage({ apiError, apiReady }) {
  return (
    <div className="settings-page">
      <div className="page-heading">
        <div>
          <h2>System Settings</h2>
          <p>Live camera and CSV data source.</p>
        </div>
      </div>
      <Panel
        title="Live Data Service"
        subtitle="Dashboard metrics are calculated from the camera event CSV."
      >
        <div className="settings-box">
          <div>
            <strong>Data source</strong>
            <span>camera_events.csv</span>
          </div>
          <div>
            <strong>Backend API</strong>
            <span>{apiError || (apiReady ? "Connected" : "Connecting")}</span>
          </div>
          <div>
            <strong>Refresh interval</strong>
            <span>2 seconds</span>
          </div>
          <div>
            <strong>Authentication</strong>
            <span>Disabled for local use</span>
          </div>
        </div>
      </Panel>
      <div className="notice">
        <ShieldCheck size={19} />
        <div>
          <strong>Production security note</strong>
          <p>
            Authentication is currently disabled. Add backend authorization
            before exposing this dashboard outside your local environment.
          </p>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Status({ status }) {
  const cls = status === "Running" ? "running" : status === "Slow" ? "slow" : "stopped";
  const icon = status === "Running" ? <Play size={12} /> : status === "Slow" ? <Hourglass size={12} /> : <XCircle size={12} />;
  return (
    <span className={`status ${cls}`}>
      <span>{icon}</span> {status}
    </span>
  );
}

function BeltRow({ belt }) {
  return (
    <div className="belt-row">
      <div>
        <strong>{belt.id}</strong>
        <span>{belt.name}</span>
      </div>
      <Status status={belt.status} />
      <strong>{belt.bags.toLocaleString()}</strong>
      <span>{belt.rate}/hr</span>
    </div>
  );
}

function CameraCard({ camera }) {
  const statusMap = {
    Online: { icon: Wifi, color: "success" },
    Warning: { icon: AlertCircle, color: "warning" },
    Offline: { icon: WifiOff, color: "danger" },
  };
  const { icon: Icon, color } = statusMap[camera.status] || statusMap.Offline;

  return (
    <div className={`camera-card ${color}`}>
      <div className="camera-card-icon">
        <Icon size={18} />
      </div>
      <div className="camera-card-info">
        <strong>{camera.id}</strong>
                <span>{camera.belt}</span>
      </div>
      <div className="camera-card-status">{camera.status}</div>
      {camera.note && <div className="camera-card-note">{camera.note}</div>}
    </div>
  );
}

function AnomalyCard({ anomaly }) {
  const iconMap = {
    belt: AlertTriangle,
    production: TrendingUp,
    camera: Camera,
  };
  const Icon = iconMap[anomaly.type] || AlertTriangle;
  return (
    <div className={`anomaly-card ${anomaly.level}`}>
      <div className={`anomaly-icon ${anomaly.level}`}>
        <Icon size={18} />
      </div>
      <div className="anomaly-content">
        <strong>{anomaly.title}</strong>
        <p>{anomaly.description}</p>
        <small>{anomaly.time}</small>
      </div>
      <span className={`anomaly-badge ${anomaly.level}`}>{anomaly.level}</span>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
