import { useState } from "react";

// ── Design tokens (matching AMS Estimator) ───────────────────────────────────
const BLUE     = "#003087";
const NAVY_D   = "#00509e";
const TEAL     = "#00a896";
const RED      = "#dc2626";
const GREEN    = "#00875a";
const AMBER    = "#d97706";
const LIGHT    = "#f8faff";
const BORDER   = "#e8ecf4";
const BORDER_L = "#f0f2f7";
const INK      = "#1a1a2e";
const INK_SEC  = "#5a6a82";
const INK_MUTED= "#9aaabf";
const SERIF    = "'Instrument Serif', Georgia, serif";
const MONO     = "'IBM Plex Mono', 'Courier New', monospace";
const SANS     = "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const SHADOW_SM = "0 2px 8px rgba(0,0,0,0.04)";
const SHADOW_MD = "0 4px 24px rgba(0,48,135,0.06)";

// ── Sample Release Data ──────────────────────────────────────────────────────
const RELEASES = [
  {
    id: "REL-2026-Q2-01",
    name: "Q2 Enhancement Bundle",
    target: "2026-05-14",
    env: "Production",
    gwVersion: "2024.2",
    module: "PolicyCenter",
    type: "Enhancement",
    riskScore: 73,
    riskBand: "HIGH",
    recommendation: "NO-GO",
    rollbackProb: 28,
    gitDiff: { filesChanged: 142, linesAdded: 3840, linesRemoved: 1210, gosuFiles: 89, pcfFiles: 31, configFiles: 22 },
    testCoverage: { before: 68, after: 71, delta: 3, criticalUncovered: 7 },
    historicalReleases: 24,
    priorFailures: 5,
    lastReleaseOutcome: "PARTIAL ROLLBACK",
    integrations: ["Duck Creek Rating", "LexisNexis", "ISO ClaimSearch", "ACORD XML Gateway"],
    targetedRegression: ["Policy Issuance", "Premium Calculation", "UW Rules Engine", "Integration Layer"],
    findings: [
      { sev:"CRITICAL", area:"UW Rules Engine", detail:"14 Gosu rule files modified with no corresponding test updates. High mutation risk.", fix:"Add unit tests for all modified rule functions before release." },
      { sev:"HIGH",     area:"Integration Layer", detail:"ACORD XML Gateway response handler refactored — no integration test environment available.", fix:"Run integration smoke test suite in staging before cutover." },
      { sev:"HIGH",     area:"PCF Screens",       detail:"31 PCF screen changes across 4 workflows. UI regression risk elevated.", fix:"Execute full UI regression on PolicyEntry and Submission workflows." },
      { sev:"MEDIUM",   area:"Database",           detail:"3 migration scripts included — rollback scripts not validated against production data volume.", fix:"Run rollback script dry-run against prod clone." },
      { sev:"LOW",      area:"Config Layer",       detail:"22 config file changes — potential environment-specific override conflicts.", fix:"Diff config files against staging and UAT environments." },
    ],
    timeline: [
      { phase:"Code Freeze",      date:"2026-04-28", status:"complete" },
      { phase:"Dev Testing",      date:"2026-04-30", status:"complete" },
      { phase:"SIT",              date:"2026-05-05", status:"in-progress" },
      { phase:"UAT Sign-off",     date:"2026-05-10", status:"pending" },
      { phase:"Go/No-Go Review",  date:"2026-05-12", status:"pending" },
      { phase:"Production Cutover",date:"2026-05-14",status:"pending" },
    ],
    aiInsight: "This release has the highest change velocity in the last 6 months (142 files). Historical data shows releases with >100 file changes carry a 3.2× higher rollback probability. The unvalidated UW rule modifications are the primary risk driver — 5 of the 6 prior production incidents originated in the rules engine. Recommend splitting: deploy config and PCF changes now, hold Gosu rule changes for REL-2026-Q2-02 after dedicated test coverage is added.",
  },
  {
    id: "REL-2026-Q2-02",
    name: "Regulatory Compliance Patch",
    target: "2026-05-28",
    env: "Production",
    gwVersion: "2024.2",
    module: "BillingCenter",
    type: "Regulatory",
    riskScore: 31,
    riskBand: "LOW",
    recommendation: "GO",
    rollbackProb: 6,
    gitDiff: { filesChanged: 18, linesAdded: 340, linesRemoved: 95, gosuFiles: 7, pcfFiles: 4, configFiles: 7 },
    testCoverage: { before: 82, after: 84, delta: 2, criticalUncovered: 0 },
    historicalReleases: 24,
    priorFailures: 1,
    lastReleaseOutcome: "SUCCESS",
    integrations: ["Payment Gateway", "FCA Reporting API"],
    targetedRegression: ["Payment Processing", "Invoice Generation", "FCA Submission"],
    findings: [
      { sev:"MEDIUM", area:"FCA Reporting",    detail:"New field mappings for FCA PS21/9 compliance — field length validation not unit-tested.", fix:"Add validation unit tests — estimated 2 hours effort." },
      { sev:"LOW",    area:"Payment Gateway",  detail:"Minor header change in payment gateway adapter — backward compatible.", fix:"Confirm with gateway vendor that old header format is still accepted for 30 days." },
    ],
    timeline: [
      { phase:"Code Freeze",       date:"2026-05-12", status:"complete" },
      { phase:"Dev Testing",       date:"2026-05-14", status:"complete" },
      { phase:"SIT",               date:"2026-05-19", status:"complete" },
      { phase:"UAT Sign-off",      date:"2026-05-23", status:"complete" },
      { phase:"Go/No-Go Review",   date:"2026-05-26", status:"in-progress" },
      { phase:"Production Cutover",date:"2026-05-28", status:"pending" },
    ],
    aiInsight: "Low-risk profile. 18 files changed, all with corresponding test updates. Regulatory patches of this size have a 94% success rate historically. The 2 findings are both LOW/MEDIUM and can be resolved pre-cutover in under 3 hours. Recommend GO with standard hyper-care monitoring for 48 hours post-deployment. No regression expansion needed beyond the targeted scope.",
  },
  {
    id: "REL-2026-Q3-00",
    name: "GW Cloud 2024.3 Upgrade",
    target: "2026-07-09",
    env: "Production",
    gwVersion: "2024.3",
    module: "InsuranceSuite",
    type: "Platform Upgrade",
    riskScore: 87,
    riskBand: "CRITICAL",
    recommendation: "NO-GO — SPLIT REQUIRED",
    rollbackProb: 41,
    gitDiff: { filesChanged: 324, linesAdded: 11200, linesRemoved: 4300, gosuFiles: 198, pcfFiles: 71, configFiles: 55 },
    testCoverage: { before: 61, after: 59, delta: -2, criticalUncovered: 18 },
    historicalReleases: 24,
    priorFailures: 5,
    lastReleaseOutcome: "PARTIAL ROLLBACK",
    integrations: ["Duck Creek Rating", "LexisNexis", "ISO ClaimSearch", "ACORD XML Gateway", "Payment Gateway", "FCA Reporting API", "Guidewire Live"],
    targetedRegression: ["Full Suite Regression", "All Integration Smoke Tests", "Performance Baseline", "Data Migration Validation"],
    findings: [
      { sev:"CRITICAL", area:"API Deprecations", detail:"47 deprecated Gosu APIs removed in 2024.3 — 12 still in use in custom code. Will cause runtime failures.", fix:"Mandatory: Update all 12 deprecated API usages before upgrade can proceed." },
      { sev:"CRITICAL", area:"Test Coverage",    detail:"Coverage dropped 2% post-merge. 18 critical paths in ClaimCenter uncovered.", fix:"Halt until coverage restored to ≥65% across all modules." },
      { sev:"HIGH",     area:"Data Migration",   detail:"3 schema changes require data migration — migration scripts not tested on production data volume (18M records).", fix:"Run migration dry-run on prod clone — estimated 6–8 hours." },
      { sev:"HIGH",     area:"Performance",      detail:"No performance baseline captured. Upgrade carries risk of regression on policy search (previously SLA-breaching in 2024.1).", fix:"Run JMeter baseline on prod-equivalent environment before cutover." },
      { sev:"MEDIUM",   area:"GW Live Config",   detail:"Guidewire Live configuration changes required — coordination with GW support needed.", fix:"Raise GW support ticket 2 weeks before upgrade date." },
    ],
    timeline: [
      { phase:"Code Freeze",       date:"2026-06-18", status:"complete" },
      { phase:"Dev Testing",       date:"2026-06-25", status:"in-progress" },
      { phase:"SIT",               date:"2026-07-02", status:"pending" },
      { phase:"UAT Sign-off",      date:"2026-07-06", status:"pending" },
      { phase:"Go/No-Go Review",   date:"2026-07-07", status:"pending" },
      { phase:"Production Cutover",date:"2026-07-09", status:"pending" },
    ],
    aiInsight: "CRITICAL risk — do not proceed as planned. This is the largest change set in 18 months. Two blocking issues must be resolved: (1) 12 deprecated API usages will cause production failures on day 1 — these are non-negotiable fixes. (2) Test coverage has declined below the minimum acceptable threshold. Historical data shows that coverage below 62% at go/no-go correlates with 78% probability of a post-release P1 incident within 7 days. Recommend: resolve deprecated APIs, restore coverage, then re-score. If timeline cannot slip, split the upgrade: deploy GW platform upgrade first in isolation, then layer custom code changes in a separate release 2 weeks later.",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const RISK_COLORS = { LOW: GREEN, MEDIUM: AMBER, HIGH: "#dc2626", CRITICAL: "#7C2D12" };
const RISK_BG     = { LOW: "#dcfce7", MEDIUM: "#FEF3C7", HIGH: "#FEE2E2", CRITICAL: "#FEE2E2" };
const SEV_COLORS  = { CRITICAL:"#7C2D12", HIGH:"#dc2626", MEDIUM: AMBER, LOW: INK_SEC };
const SEV_BG      = { CRITICAL:"#FEE2E2", HIGH:"#FEE2E2", MEDIUM:"#FEF3C7", LOW:"#F3F4F6" };

function scoreColor(s) {
  if (s >= 75) return "#7C2D12";
  if (s >= 50) return "#dc2626";
  if (s >= 25) return AMBER;
  return GREEN;
}

function RiskGauge({ score }) {
  const c = scoreColor(score);
  return (
    <div style={{ position:"relative", width:120, height:66, margin:"0 auto 8px" }}>
      <svg width="120" height="66" viewBox="0 0 120 66">
        <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke={BORDER} strokeWidth="10" strokeLinecap="round"/>
        <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke={c} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${(score/100)*157} 157`}/>
        <text x="60" y="55" textAnchor="middle" fontSize="20" fontWeight="900" fill={c} fontFamily={MONO}>{score}</text>
      </svg>
    </div>
  );
}

export default function ReleaseRiskPredictor() {
  const [selected, setSelected] = useState(RELEASES[0]);
  const [tab, setTab] = useState("overview");

  const rel = selected;
  const rcColor = rel.recommendation.startsWith("NO") ? RED : GREEN;

  const Card = ({ children, style={} }) => (
    <div style={{ background:"#fff", borderRadius:16, border:`1px solid ${BORDER}`, padding:20, boxShadow:SHADOW_SM, ...style }}>
      {children}
    </div>
  );

  const STitle = ({ children }) => (
    <div style={{ fontSize:10, fontWeight:800, color:BLUE, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:14, paddingBottom:8, borderBottom:`2px solid ${BLUE}` }}>
      {children}
    </div>
  );

  const Badge = ({ label, color, bg }) => (
    <span style={{ fontSize:10, fontWeight:700, color, background:bg, padding:"2px 10px", borderRadius:9999, whiteSpace:"nowrap", fontFamily:SANS }}>
      {label}
    </span>
  );

  const TABS = [
    { id:"overview",   label:"📊 Overview" },
    { id:"findings",   label:"🔍 Risk Findings" },
    { id:"coverage",   label:"🧪 Test Coverage" },
    { id:"timeline",   label:"📅 Timeline" },
    { id:"regression", label:"🎯 Targeted Regression" },
    { id:"ai",         label:"🤖 AI Insight" },
  ];

  const renderTab = () => {
    switch (tab) {
      case "overview": return (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

          {/* Hero risk card */}
          <Card style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:24,
            background:`linear-gradient(135deg,${BLUE},${NAVY_D})`, color:"#fff", border:"none", boxShadow:SHADOW_MD }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, opacity:0.6, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6, fontFamily:MONO }}>Release</div>
              <div style={{ fontSize:24, fontWeight:400, fontFamily:SERIF, lineHeight:1.2 }}>{rel.name}</div>
              <div style={{ fontSize:11, opacity:0.7, marginTop:6, fontFamily:MONO }}>{rel.id} · {rel.module} · {rel.gwVersion} · Target: {rel.target}</div>
              <div style={{ marginTop:14, display:"flex", gap:8, flexWrap:"wrap" }}>
                <Badge label={rel.type} color="#fff" bg="rgba(255,255,255,0.2)"/>
                <Badge label={rel.env}  color="#fff" bg="rgba(255,255,255,0.2)"/>
                <Badge
                  label={`Rollback risk: ${rel.rollbackProb}%`}
                  color={rel.rollbackProb > 30 ? "#FEE2E2" : "#dcfce7"}
                  bg={rel.rollbackProb > 30 ? "rgba(220,38,38,0.3)" : "rgba(0,135,90,0.3)"}
                />
              </div>
            </div>
            <div style={{ textAlign:"center", flexShrink:0 }}>
              <RiskGauge score={rel.riskScore}/>
              <div style={{ fontSize:11, fontWeight:700, color:scoreColor(rel.riskScore), background:"#fff", borderRadius:9999, padding:"3px 14px", marginBottom:8 }}>
                {rel.riskBand} RISK
              </div>
              <div style={{ fontSize:12, fontWeight:700, background:rcColor, color:"#fff", borderRadius:8, padding:"7px 18px", letterSpacing:"0.02em", fontFamily:SANS }}>
                {rel.recommendation}
              </div>
            </div>
          </Card>

          {/* Git diff */}
          <Card>
            <STitle>Git Diff Summary</STitle>
            {[
              { label:"Files Changed",    value: rel.gitDiff.filesChanged },
              { label:"Lines Added",      value: `+${rel.gitDiff.linesAdded.toLocaleString()}` },
              { label:"Lines Removed",    value: `-${rel.gitDiff.linesRemoved.toLocaleString()}` },
              { label:"Gosu Files",       value: rel.gitDiff.gosuFiles },
              { label:"PCF Screen Files", value: rel.gitDiff.pcfFiles },
              { label:"Config Files",     value: rel.gitDiff.configFiles },
            ].map(r => (
              <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${BORDER_L}` }}>
                <span style={{ fontSize:12, color:INK_SEC }}>{r.label}</span>
                <span style={{ fontSize:13, fontWeight:800, color:BLUE, fontFamily:MONO }}>{r.value}</span>
              </div>
            ))}
          </Card>

          {/* Historical signal */}
          <Card>
            <STitle>Historical Signal</STitle>
            {[
              { label:"Total Releases Analysed", value: rel.historicalReleases },
              { label:"Prior Failures",           value: rel.priorFailures,            warn: rel.priorFailures > 3 },
              { label:"Last Release Outcome",     value: rel.lastReleaseOutcome,       warn: rel.lastReleaseOutcome !== "SUCCESS" },
              { label:"Critical Uncovered Paths", value: rel.testCoverage.criticalUncovered, warn: rel.testCoverage.criticalUncovered > 0 },
            ].map(r => (
              <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${BORDER_L}` }}>
                <span style={{ fontSize:12, color:INK_SEC }}>{r.label}</span>
                <span style={{ fontSize:13, fontWeight:800, fontFamily:MONO, color: r.warn ? RED : BLUE }}>{r.value}</span>
              </div>
            ))}
            <div style={{ marginTop:12, padding:"10px 12px", background: rel.priorFailures > 3 ? "#FEE2E2" : "#dcfce7", borderRadius:8 }}>
              <div style={{ fontSize:11, fontWeight:700, color: rel.priorFailures > 3 ? RED : GREEN }}>
                {rel.priorFailures > 3 ? "⚠ Elevated failure history — apply heightened scrutiny" : "✓ Acceptable historical failure rate"}
              </div>
            </div>
          </Card>

          {/* Integrations */}
          <Card style={{ gridColumn:"1/-1" }}>
            <STitle>Integrations in Scope</STitle>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {rel.integrations.map(i => (
                <div key={i} style={{ padding:"5px 14px", background:LIGHT, borderRadius:9999, fontSize:11, color:BLUE, fontWeight:600, border:`1px solid ${BORDER}` }}>{i}</div>
              ))}
            </div>
          </Card>
        </div>
      );

      case "findings": return (
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            {["CRITICAL","HIGH","MEDIUM","LOW"].map(sev => {
              const count = rel.findings.filter(f => f.sev === sev).length;
              return count > 0 ? (
                <div key={sev} style={{ padding:"5px 14px", borderRadius:9999, background:SEV_BG[sev], border:`1.5px solid ${SEV_COLORS[sev]}40` }}>
                  <span style={{ fontWeight:700, fontSize:11, color:SEV_COLORS[sev] }}>{sev}: {count}</span>
                </div>
              ) : null;
            })}
          </div>
          {rel.findings.map((f, i) => (
            <Card key={i} style={{ marginBottom:12, borderLeft:`4px solid ${SEV_COLORS[f.sev]}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div style={{ fontWeight:700, fontSize:13, color:INK }}>{f.area}</div>
                <Badge label={f.sev} color={SEV_COLORS[f.sev]} bg={SEV_BG[f.sev]}/>
              </div>
              <div style={{ fontSize:12, color:INK_SEC, lineHeight:1.65, marginBottom:10 }}>{f.detail}</div>
              <div style={{ padding:"9px 12px", background:"#F0FDF4", borderRadius:8, borderLeft:`3px solid ${GREEN}` }}>
                <div style={{ fontSize:10, fontWeight:800, color:GREEN, marginBottom:2, textTransform:"uppercase", letterSpacing:"0.07em" }}>Recommended Action</div>
                <div style={{ fontSize:12, color:"#166534" }}>{f.fix}</div>
              </div>
            </Card>
          ))}
        </div>
      );

      case "coverage": return (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Card>
            <STitle>Coverage Delta</STitle>
            <div style={{ textAlign:"center", padding:"16px 0" }}>
              <div style={{ fontSize:10, color:INK_MUTED, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>Before Merge</div>
              <div style={{ fontSize:42, fontWeight:900, color:BLUE, fontFamily:MONO }}>{rel.testCoverage.before}%</div>
              <div style={{ fontSize:24, color:INK_MUTED, margin:"8px 0" }}>↓</div>
              <div style={{ fontSize:10, color:INK_MUTED, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>After Merge</div>
              <div style={{ fontSize:42, fontWeight:900, color: rel.testCoverage.delta < 0 ? RED : GREEN, fontFamily:MONO }}>
                {rel.testCoverage.after}%
              </div>
              <div style={{ marginTop:14, display:"inline-block", padding:"6px 18px", borderRadius:9999, background: rel.testCoverage.delta < 0 ? "#FEE2E2" : "#dcfce7" }}>
                <span style={{ fontWeight:800, fontSize:14, color: rel.testCoverage.delta < 0 ? RED : GREEN }}>
                  {rel.testCoverage.delta >= 0 ? "+" : ""}{rel.testCoverage.delta}% delta
                </span>
              </div>
            </div>
          </Card>
          <Card>
            <STitle>Coverage Thresholds</STitle>
            {[
              { label:"Minimum acceptable",        threshold:"62%", status: rel.testCoverage.after >= 62 ? "PASS" : "FAIL" },
              { label:"Target (industry standard)", threshold:"75%", status: rel.testCoverage.after >= 75 ? "PASS" : "FAIL" },
              { label:"Excellence benchmark",       threshold:"85%", status: rel.testCoverage.after >= 85 ? "PASS" : "FAIL" },
            ].map(r => (
              <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${BORDER_L}` }}>
                <div>
                  <div style={{ fontSize:12, color:INK_SEC }}>{r.label}</div>
                  <div style={{ fontSize:11, color:INK_MUTED, fontFamily:MONO }}>{r.threshold}</div>
                </div>
                <Badge label={r.status} color={r.status === "PASS" ? GREEN : RED} bg={r.status === "PASS" ? "#dcfce7" : "#FEE2E2"}/>
              </div>
            ))}
            <div style={{ marginTop:14 }}>
              <div style={{ fontSize:10, fontWeight:700, color:INK_MUTED, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>Critical Uncovered Paths</div>
              <div style={{ fontSize:36, fontWeight:900, color: rel.testCoverage.criticalUncovered > 0 ? RED : GREEN, fontFamily:MONO, textAlign:"center" }}>
                {rel.testCoverage.criticalUncovered}
              </div>
              {rel.testCoverage.criticalUncovered > 0 && (
                <div style={{ fontSize:11, color:"#991B1B", textAlign:"center", marginTop:4 }}>critical paths without test coverage</div>
              )}
            </div>
          </Card>
          <Card style={{ gridColumn:"1/-1" }}>
            <STitle>Coverage Bar</STitle>
            <div style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:INK_MUTED, marginBottom:6 }}>
                <span>0%</span>
                <span style={{ color:AMBER }}>62% min</span>
                <span style={{ color:BLUE }}>75% target</span>
                <span>100%</span>
              </div>
              <div style={{ position:"relative", height:24, background:BORDER_L, borderRadius:12 }}>
                <div style={{ position:"absolute", left:"62%", top:0, bottom:0, width:2, background:AMBER }}/>
                <div style={{ position:"absolute", left:"75%", top:0, bottom:0, width:2, background:BLUE }}/>
                <div style={{ position:"absolute", left:0, top:0, bottom:0, borderRadius:12,
                  width:`${rel.testCoverage.after}%`,
                  background: rel.testCoverage.after >= 75 ? GREEN : rel.testCoverage.after >= 62 ? AMBER : RED,
                  transition:"width 0.5s" }}/>
                <div style={{ position:"absolute", top:4, left:`${rel.testCoverage.after - 3}%`, fontSize:11, fontWeight:800, color:"#fff", fontFamily:MONO }}>
                  {rel.testCoverage.after}%
                </div>
              </div>
            </div>
          </Card>
        </div>
      );

      case "timeline": return (
        <Card>
          <STitle>Release Timeline</STitle>
          <div style={{ position:"relative", paddingLeft:32 }}>
            <div style={{ position:"absolute", left:11, top:0, bottom:0, width:2, background:BORDER }}/>
            {rel.timeline.map((phase, i) => {
              const c = phase.status === "complete" ? GREEN : phase.status === "in-progress" ? AMBER : INK_MUTED;
              const icon = phase.status === "complete" ? "✓" : phase.status === "in-progress" ? "●" : "○";
              return (
                <div key={i} style={{ position:"relative", marginBottom:20 }}>
                  <div style={{ position:"absolute", left:-32, top:0, width:22, height:22, borderRadius:"50%",
                    background: phase.status === "complete" ? GREEN : phase.status === "in-progress" ? AMBER : BORDER,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", fontWeight:900, border:`2px solid ${c}` }}>
                    {icon}
                  </div>
                  <div style={{ padding:"10px 14px",
                    background: phase.status === "in-progress" ? "#FEF9C3" : LIGHT,
                    borderRadius:8, border:`1px solid ${phase.status === "in-progress" ? AMBER : BORDER}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ fontWeight:600, fontSize:13, color: phase.status === "pending" ? INK_MUTED : INK }}>{phase.phase}</div>
                      <div style={{ fontSize:11, fontFamily:MONO, color:INK_MUTED }}>{phase.date}</div>
                    </div>
                    <div style={{ marginTop:4 }}>
                      <Badge label={phase.status.toUpperCase()} color={c} bg={c + "20"}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      );

      case "regression": return (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Card style={{ gridColumn:"1/-1" }}>
            <STitle>AI-Recommended Targeted Regression Scope</STitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {rel.targetedRegression.map((t, i) => (
                <div key={i} style={{ padding:"10px 14px", background:LIGHT, borderRadius:8, borderLeft:`3px solid ${BLUE}`, border:`1px solid ${BORDER}`, borderLeftWidth:3, fontSize:12, fontWeight:600, color:BLUE }}>
                  🎯 {t}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <STitle>Regression Scope Logic</STitle>
            {[
              { label:"Changed Gosu files mapped to", value:`${rel.gitDiff.gosuFiles} test suites` },
              { label:"PCF changes trigger",          value:"UI regression scope" },
              { label:"Integration changes trigger",  value:"Smoke test suite" },
              { label:"Config changes trigger",       value:"Config validation scripts" },
            ].map(r => (
              <div key={r.label} style={{ padding:"8px 0", borderBottom:`1px solid ${BORDER_L}`, fontSize:12 }}>
                <span style={{ color:INK_SEC }}>{r.label} </span>
                <span style={{ fontWeight:700, color:BLUE }}>{r.value}</span>
              </div>
            ))}
          </Card>
          <Card>
            <STitle>Estimated Regression Effort</STitle>
            {[
              { area:"Core Regression (AI-selected)",  hours: Math.round(rel.gitDiff.gosuFiles * 0.4) },
              { area:"Integration Smoke Tests",         hours: rel.integrations.length * 2 },
              { area:"UI Regression (PCF changes)",     hours: Math.round(rel.gitDiff.pcfFiles * 0.8) },
              { area:"Config Validation",               hours: Math.round(rel.gitDiff.configFiles * 0.3) },
            ].map(r => (
              <div key={r.area} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${BORDER_L}` }}>
                <span style={{ fontSize:11, color:INK_SEC }}>{r.area}</span>
                <span style={{ fontSize:12, fontWeight:800, color:BLUE, fontFamily:MONO }}>{r.hours}h</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 12px", background:LIGHT, borderRadius:8, marginTop:10, border:`1px solid ${BORDER}` }}>
              <span style={{ fontSize:12, fontWeight:700, color:BLUE }}>Total Estimated</span>
              <span style={{ fontSize:14, fontWeight:900, color:BLUE, fontFamily:MONO }}>
                {Math.round(rel.gitDiff.gosuFiles * 0.4) + rel.integrations.length * 2 + Math.round(rel.gitDiff.pcfFiles * 0.8) + Math.round(rel.gitDiff.configFiles * 0.3)}h
              </span>
            </div>
          </Card>
        </div>
      );

      case "ai": return (
        <Card style={{ borderLeft:`4px solid ${BLUE}`, background:LIGHT }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:BLUE, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>🤖</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:BLUE }}>AI Release Intelligence</div>
              <div style={{ fontSize:11, color:INK_MUTED, fontFamily:MONO }}>
                Trained on 24 historical releases · {new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
              </div>
            </div>
            <div style={{ marginLeft:"auto" }}>
              <div style={{ padding:"5px 14px", background:rcColor, color:"#fff", borderRadius:9999, fontWeight:700, fontSize:12 }}>
                {rel.recommendation}
              </div>
            </div>
          </div>
          <div style={{ fontSize:13, color:INK, lineHeight:1.8, background:"#fff", padding:18, borderRadius:12, border:`1px solid ${BORDER}` }}>
            {rel.aiInsight}
          </div>
          <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {[
              { label:"Risk Score",    value: rel.riskScore + "/100", color: scoreColor(rel.riskScore) },
              { label:"Rollback Prob.",value: rel.rollbackProb + "%", color: rel.rollbackProb > 25 ? RED : GREEN },
              { label:"Files Changed", value: rel.gitDiff.filesChanged, color: BLUE },
            ].map(k => (
              <div key={k.label} style={{ textAlign:"center", padding:"12px 8px", background:"#fff", borderRadius:10, border:`1px solid ${BORDER}` }}>
                <div style={{ fontSize:9, color:INK_MUTED, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>{k.label}</div>
                <div style={{ fontSize:22, fontWeight:900, color:k.color, fontFamily:MONO }}>{k.value}</div>
              </div>
            ))}
          </div>
        </Card>
      );

      default: return null;
    }
  };

  return (
    <div style={{ fontFamily:SANS, minHeight:"100vh", background:LIGHT }}>

      {/* Topbar */}
      <div style={{ background:"#fff", height:60, display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 28px", position:"sticky", top:0, zIndex:100, borderBottom:`1px solid ${BORDER}`, boxShadow:SHADOW_SM }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:36, height:36, background:BLUE, borderRadius:8, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:18, color:"#fff", fontFamily:SERIF, flexShrink:0 }}>
            R
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:INK, lineHeight:1.2 }}>Release Risk Predictor</div>
            <div style={{ fontSize:10, color:INK_MUTED, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", marginTop:1 }}>
              Guidewire AMS · Predictive Analytics
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ padding:"3px 12px", background:LIGHT, border:`1px solid ${BORDER}`, borderRadius:9999, fontSize:11, color:INK_SEC, fontWeight:600 }}>
            🚀 {rel.id}
          </div>
          <div style={{ padding:"3px 12px", background:rcColor, borderRadius:9999, fontSize:11, color:"#fff", fontWeight:700, fontFamily:MONO }}>
            {rel.recommendation}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px" }}>

        {/* Release selector */}
        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          {RELEASES.map(r => (
            <div key={r.id} onClick={() => { setSelected(r); setTab("overview"); }}
              style={{ flex:1, padding:"12px 14px", borderRadius:12, cursor:"pointer",
                border:`2px solid ${selected.id === r.id ? BLUE : BORDER}`,
                background: selected.id === r.id ? LIGHT : "#fff",
                boxShadow: selected.id === r.id ? SHADOW_MD : SHADOW_SM,
                transition:"border-color 0.15s, box-shadow 0.15s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <div style={{ fontSize:11, fontWeight:700, color: selected.id === r.id ? BLUE : INK }}>{r.name}</div>
                <div style={{ fontSize:10, fontWeight:700, color:RISK_COLORS[r.riskBand], background:RISK_BG[r.riskBand], padding:"1px 8px", borderRadius:9999 }}>{r.riskBand}</div>
              </div>
              <div style={{ fontSize:10, color:INK_MUTED, fontFamily:MONO }}>{r.module} · {r.target}</div>
              <div style={{ marginTop:8, height:4, background:BORDER, borderRadius:2 }}>
                <div style={{ height:4, width:`${r.riskScore}%`, background:scoreColor(r.riskScore), borderRadius:2 }}/>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:9, color:INK_MUTED, fontFamily:MONO }}>
                <span>Risk: {r.riskScore}/100</span><span>Rollback: {r.rollbackProb}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sub-nav tabs */}
        <div style={{ background:"#fff", borderRadius:12, border:`1px solid ${BORDER}`, padding:"0 4px",
          display:"flex", gap:0, marginBottom:16, overflowX:"auto", boxShadow:SHADOW_SM }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding:"12px 16px", border:"none", background:"none", cursor:"pointer",
                fontSize:11, fontWeight: tab === t.id ? 600 : 500, whiteSpace:"nowrap",
                color: tab === t.id ? BLUE : INK_SEC,
                borderBottom: tab === t.id ? `2.5px solid ${BLUE}` : "2.5px solid transparent",
                transition:"color 0.15s, border-color 0.15s", fontFamily:SANS }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {renderTab()}

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:24, fontSize:10, color:INK_MUTED, fontFamily:MONO }}>
          Release Risk Predictor · Guidewire AMS · Trained on {rel.historicalReleases} historical releases · Confidential
        </div>
      </div>
    </div>
  );
}
