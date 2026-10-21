# Sugar Mill — Operations Dashboard

A rebuilt production dashboard for sugar bagging, conveyors, camera counting and godown output. React 18 + Vite, using your existing Python API routes.

## See the design immediately

Extract this ZIP and open **OPEN_DASHBOARD_PREVIEW.html** in Chrome, Edge or Firefox. The application and fonts are embedded, so no installation is needed to review the dashboard. It opens in **Sample data** mode with clearly labeled illustrative records. This preview is for design review; use the development server for live camera, training and API operations.

## Run with your backend

```bash
npm ci
npm run dev
```

Open the Local URL printed by Vite. The development proxy forwards `/api/*` to `http://127.0.0.1:8000`. Keep **Sample data** switched off for live records. No Python backend, models, datasets or credentials are included.

```bash
npm run build
npm run preview
```

`dist/` contains the production deployment after building. A production web server must route `/api/*` to your backend; Vite's development proxy does not configure production routing. The ZIP contains source and original media; dependencies and generated `dist/` are excluded.

## What was redesigned

- New application shell with grouped navigation, workspace context and a report-date toolbar.
- Purpose-built production cards with source counts and previous-day comparison.
- Hourly and cumulative production chart with previous-day context.
- Target achievement from combined configured godown targets, with actual and remaining bags.
- Searchable conveyor table, operating-state labels and CSV report export.
- Exception queue, godown comparison and recent bag-crossing table.
- Local Inter fonts, green/slate palette, consistent surfaces, light/dark themes and mobile layouts.
- Existing camera, counting-line, video testing and model-training workflows retained.

## Data behavior

Live is the default. Sample mode must be explicitly selected, except in the standalone preview, and is never merged with live records. Date controls and refresh are disabled while reviewing sample data. Camera and training tools always use your backend, even if sample mode is selected. The sample toggle changes reporting data only.

If the API is unavailable before the first response, metrics display dashes. If the connection fails later, the interface identifies the retained values as the last received data. The footer shows response receipt time. Production targets are shown only when godown targets exist. The dashboard does not infer OEE, recovery, cane weight, quality or sugar tonnage from bag counts.

The CSV export contains the currently searched conveyor rows. Sample exports have a `sample-` filename prefix. Targets are combined godown targets; configure them for the same reporting period to make the percentage meaningful.

## Market references and design rationale

Reviewed these official industrial dashboard references:

- Ignition Launchpad KPI and OEE: https://pages.inductiveautomation.com/ignition-launchpad
- Ignition Launchpad OEE project: https://inductiveautomation.com/exchange/2815/overview
- AVEVA HMI and operator visibility: https://www.aveva.com/en/solutions/operations/hmi/
- Siemens Insights Hub monitoring: https://documentation.mindsphere.io/MindSphere/apps/insights-hub-monitor/introduction.html

These products emphasize operational KPIs, time context, trends, equipment visibility and events. This implementation applies those patterns to the existing bag-counting data contract with an original visual design. It is not affiliated with these vendors and does not claim their capabilities.

## Main files

- `src/components/OperationsDashboard.jsx`: rebuilt overview, chart, table, search and export.
- `src/professional.css`: application visual system and responsive behavior.
- `src/data/sampleDashboard.js`: explicitly labeled presentation records.
- `src/main.jsx`: application navigation, reporting filters and existing operational tools.
- `src/services/api.js`: existing dashboard API integration.

After a new production build, run `node scripts/create-preview.mjs` to refresh the standalone preview. Font license is included in `public/fonts/LICENSE.txt`.

## Validation

Production build passed. Browser checks covered navigation, chart mode switching, search, CSV export, godown drilldown, theme switching, disconnected state and filter request parameters. Overview layouts were checked at 390, 680, 800, 1024, 1440 and 1920 pixels without page overflow. API rendering was checked with a fixture; actual camera hardware and training execution require the separate backend.
