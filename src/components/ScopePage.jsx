import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowRight, Camera, CheckCircle2, ChevronRight, Flame, CloudFog, HardHat, ScanLine, Scale, Package, Tags, BarChart3, Sparkles, X, Eye, Layers } from "lucide-react";
import "./scope.css";

const modules = [
  {
    id: "fire", title: "Small fire detection", category: "Safety", icon: Flame, color: "#f97316",
    label: "Earlier visibility. Faster response.",
    description: "A possible visual monitoring layer for small flames around conveyors, storage and production equipment.",
    alt: "Illustrative small flame near packing material beside a warehouse conveyor",
    benefit: "Bring potential fire events to the attention of the mill team in one place.",
    steps: ["Monitor selected camera zones", "Flag a possible flame for review", "Attach a snapshot to a safety event"],
    note: "A future monitoring aid alongside the mill’s established fire safety systems.",
    overlay: "Possible flame",
  },
  {
    id: "smoke", title: "Smoke detection", category: "Safety", icon: CloudFog, color: "#8097af",
    label: "See a developing concern.",
    description: "A proposed way to highlight visible smoke near machinery and stored materials for operator review.",
    alt: "Illustrative grey smoke rising near industrial machinery in a warehouse",
    benefit: "Give operators visual context when checking a potential smoke event.",
    steps: ["Observe designated equipment areas", "Highlight possible smoke", "Review the scene and record a response"],
    note: "A future model would need to distinguish smoke from dust and steam in the mill.",
    overlay: "Possible smoke",
  },
  {
    id: "ppe", title: "PPE compliance", category: "Safety", icon: HardHat, color: "#d5a52a",
    label: "Make safety more visible.",
    description: "Show how helmet and high-visibility vest checks could support safety reviews in designated work areas.",
    alt: "Illustrative factory workers wearing hard hats, reflective vests and safety equipment",
    benefit: "Help supervisors review visible protective equipment against site requirements.",
    steps: ["Choose site-specific PPE requirements", "Check visible helmets and vests", "Review potential missing-equipment events"],
    note: "The preview illustrates helmet and vest checks; other PPE would depend on the future model.",
    overlay: "Helmet / vest concept",
  },
  {
    id: "restricted", title: "Restricted area monitoring", category: "Safety", icon: ScanLine, color: "#a78bfa",
    label: "Define a zone. Keep it in view.",
    description: "A future zone-based feature to bring attention to people entering marked machinery or access-control areas.",
    alt: "Illustrative worker near a yellow marked machinery exclusion zone in a warehouse",
    benefit: "Make potential access events easier to review with a zone and a camera snapshot.",
    steps: ["Draw a restricted zone on the camera view", "Flag a person entering the zone", "Review a time-stamped access event"],
    note: "Zones and entry rules would be configured for each camera before activation.",
    overlay: "Example restricted zone",
  },
  {
    id: "weight", title: "Sugar bag weight monitoring", category: "Operations", icon: Scale, color: "#2dd4bf",
    label: "Connect counts with weight.",
    description: "An integration concept for showing bag counts alongside weighing information in a unified production view.",
    alt: "Illustrative filled sugar sack on an industrial platform weighing scale",
    benefit: "Bring count and weight records together for packing and dispatch reviews.",
    steps: ["Connect a weighing data source", "Associate a reading with a bag event", "Review weight records and configured limits"],
    note: "Concept only. Accurate kilograms would come from a weighing source; no weight is measured here.",
    overlay: "Weighing integration concept",
  },
];

const available = [
  { icon: Camera, title: "Live bag monitoring", text: "Connect an RTSP camera, draw a counting line and review bag crossings.", page: "Dashboard" },
  { icon: Package, title: "Video-based bag testing", text: "Upload a local video and inspect results from the active bag model.", page: "Dashboard" },
  { icon: Tags, title: "Dataset & model training", text: "Upload photos, label bags and train or activate a model from the review workflow.", page: "Training" },
  { icon: BarChart3, title: "Production history", text: "Explore recorded counts, hourly trends and event history with date and time filters.", page: "Production" },
];

export function ScopeBanner({ onExplore }) {
  return <div className="scope-banner">
    <div className="scope-banner-icon"><Layers size={22} /></div>
    <div><strong>Your mill. A wider view.</strong><p>Explore today’s bag-counting tools and five possible add-ons for safety and operations.</p></div>
    <button onClick={onExplore}>Explore scope <ArrowUpRight size={17} /></button>
  </div>;
}

// Public files use fixed names so replacing a demo requires no source changes.
function AddonMedia({ module, onPreview }) {
  const [failed, setFailed] = useState(false);
  const [started, setStarted] = useState(false);
  const poster = `${import.meta.env.BASE_URL}addon-previews/${module.id}.png`;
  if (!started || failed) {
    const image = <img src={poster} alt={module.alt} loading="lazy" />;
    if (!failed) {
      return <button type="button" className="scope-photo-fallback" onClick={() => setStarted(true)} aria-label={`Play ${module.title} demo video`}>{image}</button>;
    }
    return onPreview
      ? <button className="scope-photo-fallback" onClick={onPreview} aria-label={`View ${module.title} concept preview`}>{image}</button>
      : image;
  }
  return <video
    className="scope-demo-video"
    src={`${import.meta.env.BASE_URL}addon-videos/${module.id}.mp4`}
    poster={poster}
    autoPlay
    controls
    playsInline
    preload="metadata"
    aria-label={`${module.title} demo video`}
    onError={() => setFailed(true)}
    onPlay={(event) => {
      document.querySelectorAll(".scope-demo-video").forEach((video) => {
        if (video !== event.currentTarget) video.pause();
      });
    }}
  >Your browser does not support video playback.</video>;
}

function PreviewDialog({ module, onClose }) {
  const ref = useRef(null);
  const [overlay, setOverlay] = useState(false);
  useEffect(() => {
    const previous = document.activeElement;
    document.querySelectorAll(".scope-demo-video").forEach((video) => video.pause());
    ref.current.showModal();
    return () => { previous?.focus(); };
  }, []);
  const Icon = module.icon;
  return <dialog ref={ref} className="scope-dialog" aria-labelledby="scope-dialog-title" onCancel={onClose} onClose={onClose} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="scope-dialog-inner">
      <header><span className="scope-eyebrow"><Icon size={16} /> CONCEPT PREVIEW</span><button className="scope-icon-button" aria-label="Close preview" onClick={onClose} autoFocus><X size={21} /></button></header>
      <div className={`scope-preview-image scope-scene-${module.id}`}>
        <AddonMedia module={module} />
        <span className="scope-image-label">Demo preview · proposed add-on</span>
        {overlay && <div className={`scope-concept-overlay scope-overlay-${module.id}`} aria-label="Illustrative overlay, not a detection result"><span>{module.overlay}</span></div>}
      </div>
      <div className="scope-dialog-body">
        <div className="scope-dialog-title"><div><h2 id="scope-dialog-title">{module.title}</h2><p>{module.description}</p></div></div>
        <button className="scope-overlay-toggle" aria-pressed={overlay} onClick={() => setOverlay(!overlay)}><Eye size={16} /> {overlay ? "Hide" : "Show"} illustrative overlay</button>
        <p className="scope-overlay-note">The overlay is drawn for explanation only. No detection is running.</p>
        <h3>How this could work</h3>
        <ol className="scope-workflow">{module.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        <div className="scope-dialog-note"><strong>Potential benefit</strong><p>{module.benefit}</p><p>{module.note}</p></div>
      </div>
    </div>
  </dialog>;
}

export default function ScopePage({ onNavigate }) {
  const [category, setCategory] = useState("All add-ons");
  const [selected, setSelected] = useState(null);
  const visible = modules.filter((m) => category === "All add-ons" || m.category === category);
  return <div className="scope-page">
    <section className="scope-hero" aria-labelledby="scope-title">
      <div className="scope-hero-copy">
        <span className="scope-eyebrow"><Layers size={16} /> THE SUGAR MILL PLATFORM</span>
        <h2 id="scope-title">Count today.<br /><em>See what’s possible.</em></h2>
        <p>One place to understand production, review bag counts and explore the next layer of visibility for your mill.</p>
        <button className="scope-hero-button" onClick={() => onNavigate("Dashboard")}>Open production dashboard <ArrowRight size={17} /></button>
      </div>
      <div className="scope-platform-map" aria-label="Current scope: camera, bag model, line crossing, production records">
        <div className="scope-map-top"><span className="scope-small-dot" /> CURRENT WORKFLOW <span>01 — 04</span></div>
        {[ [Camera,"Camera / video","Bring the scene into view"], [Package,"Bag model","Locate bags in each frame"], [ScanLine,"Counting line","Count tracked bag crossings"], [BarChart3,"Production records","Review counts and history"] ].map(([Icon,title,text],i) => <div className="scope-map-step" key={title}><span className="scope-step-icon"><Icon size={20} /></span><div><strong>{title}</strong><small>{text}</small></div><span className="scope-step-number">0{i+1}</span></div>)}
      </div>
    </section>

    <section aria-labelledby="scope-current-title">
      <div className="scope-section-heading"><div><span className="scope-eyebrow">BUILT INTO YOUR DASHBOARD</span><h2 id="scope-current-title">What you can do today</h2></div><span className="scope-current-badge"><CheckCircle2 size={15} /> Existing capabilities</span></div>
      <div className="scope-current-grid">{available.map(({icon:Icon,title,text,page}) => <button className="scope-current-card" key={title} onClick={() => onNavigate(page)}><Icon size={23} /><h3>{title}</h3><p>{text}</p><span>Open {page.toLowerCase()} <ArrowUpRight size={15} /></span></button>)}</div>
    </section>

    <section aria-labelledby="scope-addons-title">
      <div className="scope-section-heading scope-addons-heading"><div><span className="scope-eyebrow">A LOOK AHEAD</span><h2 id="scope-addons-title">More possibilities for your mill</h2><p>Five proposed extensions. Explore the concept behind each one.</p></div><span className="scope-proposed-badge"><Sparkles size={15} /> Future add-ons</span></div>
      <div className="scope-preview-notice"><Eye size={19} /><p><strong>A preview of what could come next.</strong> These photo and video previews explain possible add-ons. These features are not active, and no safety detection or weight measurement runs here.</p></div>
      <div className="scope-filter-row"><div className="scope-filters" role="group" aria-label="Filter proposed add-ons">{["All add-ons", "Safety", "Operations"].map((item) => <button key={item} aria-pressed={category===item} className={category===item ? "selected" : ""} onClick={() => setCategory(item)}>{item}<span>{item==="All add-ons" ? modules.length : modules.filter((m)=>m.category===item).length}</span></button>)}</div><span className="scope-result-count" aria-live="polite">{visible.length} concepts</span></div>
      <div className="scope-addon-grid">{visible.map((module) => { const Icon=module.icon; return <article className="scope-addon-card" key={module.id} style={{"--module-color":module.color}}>
        <div className="scope-card-image"><AddonMedia module={module} onPreview={() => setSelected(module)} /><span className="scope-card-category"><Icon size={14} />{module.category}</span><button className="scope-card-view" onClick={() => setSelected(module)} aria-label={`Open ${module.title} demo preview`}><Eye size={15} /> View concept</button></div>
        <div className="scope-addon-body"><span className="scope-card-status">PROPOSED ADD-ON</span><h3>{module.title}</h3><p>{module.description}</p><div className="scope-addon-footer"><span>{module.label}</span><button onClick={() => setSelected(module)} aria-label={`Explore ${module.title}`}><ArrowUpRight size={19} /></button></div></div>
      </article>; })}</div>
    </section>
    <footer className="scope-footer"><ShieldMark /><div><strong>Designed around your mill’s needs.</strong><p>Each extension can be scoped separately, with its own camera coverage, data inputs and review workflow.</p></div><button onClick={() => onNavigate("Dashboard")}>Back to dashboard <ChevronRight size={17} /></button></footer>
    {selected && <PreviewDialog key={selected.id} module={selected} onClose={() => setSelected(null)} />}
  </div>;
}

function ShieldMark() { return <span className="scope-footer-icon"><Layers size={25} /></span>; }
