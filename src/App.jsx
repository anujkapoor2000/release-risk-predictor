import { useState } from "react";

const BLUE  = "#003087";
const RED   = "#E4002B";
const GREEN = "#16A34A";
const AMBER = "#D97706";
const LIGHT = "#E8EEF7";
const GRAY  = "#6B7280";
const MONO  = "'Courier New', monospace";
const SANS  = "'Noto Sans', 'Segoe UI', sans-serif";

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
const RISK_COLORS = { LOW: GREEN, MEDIUM: AMBER, HIGH: "#DC2626", CRITICAL: "#7C2D12" };
const RISK_BG     = { LOW: "#DCFCE7", MEDIUM: "#FEF3C7", HIGH: "#FEE2E2", CRITICAL: "#FEE2E2" };
const SEV_COLORS  = { CRITICAL:"#7C2D12", HIGH:"#DC2626", MEDIUM: AMBER, LOW: GRAY };
const SEV_BG      = { CRITICAL:"#FEE2E2", HIGH:"#FEE2E2", MEDIUM:"#FEF3C7", LOW:"#F3F4F6" };

function scoreColor(s) {
  if (s >= 75) return "#7C2D12";
  if (s >= 50) return "#DC2626";
  if (s >= 25) return AMBER;
  return GREEN;
}

function RiskGauge({ score }) {
  const c = scoreColor(score);
  const deg = Math.round((score / 100) * 180);
  return (
    <div style={{ position:"relative", width:120, height:66, margin:"0 auto 8px" }}>
      <svg width="120" height="66" viewBox="0 0 120 66">
        <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="#E5E7EB" strokeWidth="10" strokeLinecap="round"/>
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

  const Card = ({children, style={}}) => (
    <div style={{ background:"#fff", borderRadius:10, border:"1px solid #E5E7EB", padding:18, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", ...style }}>{children}</div>
  );

  const STitle = ({children}) => (
    <div style={{ fontSize:10, fontWeight:800, color:BLUE, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12, paddingBottom:6, borderBottom:`2px solid ${BLUE}` }}>{children}</div>
  );

  const Badge = ({label, color, bg}) => (
    <span style={{ fontSize:10, fontWeight:800, color, background:bg, padding:"2px 9px", borderRadius:10, whiteSpace:"nowrap" }}>{label}</span>
  );

  const TABS = [
    { id:"overview",    label:"📊 Overview" },
    { id:"findings",    label:"🔍 Risk Findings" },
    { id:"coverage",    label:"🧪 Test Coverage" },
    { id:"timeline",    label:"📅 Timeline" },
    { id:"regression",  label:"🎯 Targeted Regression" },
    { id:"ai",          label:"🤖 AI Insight" },
  ];

  const renderTab = () => {
    switch(tab) {
      case "overview": return (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {/* Risk Score */}
          <Card style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:24, background:`linear-gradient(135deg,${BLUE},#00509E)`, color:"#fff", border:"none" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, opacity:0.6, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>Release</div>
              <div style={{ fontSize:20, fontWeight:900 }}>{rel.name}</div>
              <div style={{ fontSize:12, opacity:0.75, marginTop:2 }}>{rel.id} · {rel.module} · {rel.gwVersion} · Target: {rel.target}</div>
              <div style={{ marginTop:12, display:"flex", gap:8, flexWrap:"wrap" }}>
                <Badge label={rel.type} color="#fff" bg="rgba(255,255,255,0.2)"/>
                <Badge label={rel.env} color="#fff" bg="rgba(255,255,255,0.2)"/>
                <Badge label={`Rollback risk: ${rel.rollbackProb}%`} color={rel.rollbackProb>30?"#FEE2E2":"#DCFCE7"} bg={rel.rollbackProb>30?"rgba(220,38,38,0.3)":"rgba(22,163,74,0.3)"}/>
              </div>
            </div>
            <div style={{ textAlign:"center", flexShrink:0 }}>
              <RiskGauge score={rel.riskScore}/>
              <div style={{ fontSize:11, fontWeight:700, color:scoreColor(rel.riskScore), background:"#fff", borderRadius:20, padding:"2px 14px", marginBottom:6 }}>
                {rel.riskBand} RISK
              </div>
              <div style={{ fontSize:13, fontWeight:900, background:rcColor, color:"#fff", borderRadius:8, padding:"6px 16px" }}>
                {rel.recommendation}
              </div>
            </div>
          </Card>

          {/* Change Metrics */}
          <Card>
            <STitle>Git Diff Summary</STitle>
            {[
              { label:"Files Changed",    value:rel.gitDiff.filesChanged },
              { label:"Lines Added",      value:`+${rel.gitDiff.linesAdded.toLocaleString()}` },
              { label:"Lines Removed",    value:`-${rel.gitDiff.linesRemoved.toLocaleString()}` },
              { label:"Gosu Files",       value:rel.gitDiff.gosuFiles },
              { label:"PCF Screen Files", value:rel.gitDiff.pcfFiles },
              { label:"Config Files",     value:rel.gitDiff.configFiles },
            ].map(r => (
              <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #F3F4F6" }}>
                <span style={{ fontSize:12, color:"#374151" }}>{r.label}</span>
                <span style={{ fontSize:13, fontWeight:800, color:BLUE, fontFamily:MONO }}>{r.value}</span>
              </div>
            ))}
          </Card>

          {/* Historical */}
          <Card>
            <STitle>Historical Signal</STitle>
            {[
              { label:"Total Releases Analysed",  value:rel.historicalReleases },
              { label:"Prior Failures",            value:rel.priorFailures, warn:rel.priorFailures>3 },
              { label:"Last Release Outcome",      value:rel.lastReleaseOutcome, warn:rel.lastReleaseOutcome!=="SUCCESS" },
              { label:"Critical Uncovered Paths",  value:rel.testCoverage.criticalUncovered, warn:rel.testCoverage.criticalUncovered>0 },
            ].map(r => (
              <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #F3F4F6" }}>
                <span style={{ fontSize:12, color:"#374151" }}>{r.label}</span>
                <span style={{ fontSize:13, fontWeight:800, fontFamily:MONO, color: r.warn ? RED : BLUE }}>{r.value}</span>
              </div>
            ))}
            <div style={{ marginTop:12, padding:10, background: rel.priorFailures > 3 ? "#FEE2E2" : "#DCFCE7", borderRadius:7 }}>
              <div style={{ fontSize:11, fontWeight:700, color: rel.priorFailures>3 ? RED : GREEN }}>
                {rel.priorFailures > 3 ? "⚠ Elevated failure history — apply heightened scrutiny" : "✓ Acceptable historical failure rate"}
              </div>
            </div>
          </Card>

          {/* Integrations */}
          <Card style={{ gridColumn:"1/-1" }}>
            <STitle>Integrations in Scope</STitle>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {rel.integrations.map(i => (
                <div key={i} style={{ padding:"5px 12px", background:LIGHT, borderRadius:20, fontSize:11, color:BLUE, fontWeight:600, border:`1px solid ${BLUE}30` }}>{i}</div>
              ))}
            </div>
          </Card>
        </div>
      );

      case "findings": return (
        <div>
          <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
            {["CRITICAL","HIGH","MEDIUM","LOW"].map(sev => {
              const count = rel.findings.filter(f => f.sev===sev).length;
              return count > 0 ? (
                <div key={sev} style={{ padding:"6px 14px", borderRadius:20, background:SEV_BG[sev], border:`1.5px solid ${SEV_COLORS[sev]}40` }}>
                  <span style={{ fontWeight:800, fontSize:11, color:SEV_COLORS[sev] }}>{sev}: {count}</span>
                </div>
              ) : null;
            })}
          </div>
          {rel.findings.map((f,i) => (
            <Card key={i} style={{ marginBottom:12, borderLeft:`4px solid ${SEV_COLORS[f.sev]}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div style={{ fontWeight:800, fontSize:13, color:"#111827" }}>{f.area}</div>
                <Badge label={f.sev} color={SEV_COLORS[f.sev]} bg={SEV_BG[f.sev]}/>
              </div>
              <div style={{ fontSize:12, color:"#374151", lineHeight:1.6, marginBottom:10 }}>{f.detail}</div>
              <div style={{ padding:"8px 12px", background:"#F0FDF4", borderRadius:7, borderLeft:`3px solid ${GREEN}` }}>
                <div style={{ fontSize:10, fontWeight:700, color:GREEN, marginBottom:2 }}>RECOMMENDED ACTION</div>
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
              <div style={{ fontSize:11, color:GRAY, marginBottom:4 }}>Before Merge</div>
              <div style={{ fontSize:42, fontWeight:900, color:BLUE, fontFamily:MONO }}>{rel.testCoverage.before}%</div>
              <div style={{ fontSize:24, color:GRAY, margin:"6px 0" }}>↓</div>
              <div style={{ fontSize:11, color:GRAY, marginBottom:4 }}>After Merge</div>
              <div style={{ fontSize:42, fontWeight:900, color: rel.testCoverage.delta < 0 ? RED : GREEN, fontFamily:MONO }}>
                {rel.testCoverage.after}%
              </div>
              <div style={{ marginTop:12, padding:"8px 16px", borderRadius:8, background: rel.testCoverage.delta < 0 ? "#FEE2E2" : "#DCFCE7" }}>
                <span style={{ fontWeight:800, fontSize:14, color: rel.testCoverage.delta < 0 ? RED : GREEN }}>
                  {rel.testCoverage.delta >= 0 ? "+" : ""}{rel.testCoverage.delta}% delta
                </span>
              </div>
            </div>
          </Card>
          <Card>
            <STitle>Coverage Thresholds</STitle>
            {[
              { label:"Minimum acceptable",       threshold:"62%", status: rel.testCoverage.after >= 62 ? "PASS" : "FAIL" },
              { label:"Target (industry standard)",threshold:"75%", status: rel.testCoverage.after >= 75 ? "PASS" : "FAIL" },
              { label:"Excellence benchmark",      threshold:"85%", status: rel.testCoverage.after >= 85 ? "PASS" : "FAIL" },
            ].map(r => (
              <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #F3F4F6" }}>
                <div>
                  <div style={{ fontSize:12, color:"#374151" }}>{r.label}</div>
                  <div style={{ fontSize:11, color:GRAY }}>{r.threshold}</div>
                </div>
                <Badge label={r.status} color={r.status==="PASS" ? GREEN : RED} bg={r.status==="PASS" ? "#DCFCE7" : "#FEE2E2"}/>
              </div>
            ))}
            <div style={{ marginTop:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:GRAY, marginBottom:6 }}>CRITICAL UNCOVERED PATHS</div>
              <div style={{ fontSize:32, fontWeight:900, color: rel.testCoverage.criticalUncovered > 0 ? RED : GREEN, fontFamily:MONO, textAlign:"center" }}>
                {rel.testCoverage.criticalUncovered}
              </div>
              {rel.testCoverage.criticalUncovered > 0 && (
                <div style={{ fontSize:11, color:"#991B1B", textAlign:"center" }}>critical paths without test coverage</div>
              )}
            </div>
          </Card>
          <Card style={{ gridColumn:"1/-1" }}>
            <STitle>Coverage Bar</STitle>
            <div style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:GRAY, marginBottom:4 }}>
                <span>0%</span><span style={{ color:AMBER }}>62% min</span><span style={{ color:BLUE }}>75% target</span><span>100%</span>
              </div>
              <div style={{ position:"relative", height:24, background:"#F3F4F6", borderRadius:12 }}>
                <div style={{ position:"absolute", left:"62%", top:0, bottom:0, width:2, background:AMBER }}/>
                <div style={{ position:"absolute", left:"75%", top:0, bottom:0, width:2, background:BLUE }}/>
                <div style={{ position:"absolute", left:0, top:0, bottom:0, borderRadius:12,
                  width:`${rel.testCoverage.after}%`,
                  background: rel.testCoverage.after >= 75 ? GREEN : rel.testCoverage.after >= 62 ? AMBER : RED,
                  transition:"width 0.5s" }}/>
                <div style={{ position:"absolute", top:4, left:`${rel.testCoverage.after - 3}%`, fontSize:11, fontWeight:800, color:"#fff" }}>
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
            <div style={{ position:"absolute", left:11, top:0, bottom:0, width:2, background:"#E5E7EB" }}/>
            {rel.timeline.map((phase,i) => {
              const c = phase.status === "complete" ? GREEN : phase.status === "in-progress" ? AMBER : GRAY;
              const icon = phase.status === "complete" ? "✓" : phase.status === "in-progress" ? "●" : "○";
              return (
                <div key={i} style={{ position:"relative", marginBottom:20 }}>
                  <div style={{ position:"absolute", left:-32, top:0, width:22, height:22, borderRadius:"50%",
                    background: phase.status === "complete" ? GREEN : phase.status === "in-progress" ? AMBER : "#E5E7EB",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", fontWeight:900, border:`2px solid ${c}` }}>
                    {icon}
                  </div>
                  <div style={{ padding:"10px 14px", background: phase.status === "in-progress" ? "#FEF9C3" : "#F9FAFB",
                    borderRadius:8, border:`1px solid ${phase.status==="in-progress"?AMBER:"#E5E7EB"}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ fontWeight:700, fontSize:13, color:phase.status==="pending"?GRAY:"#111827" }}>{phase.phase}</div>
                      <div style={{ fontSize:11, fontFamily:MONO, color:GRAY }}>{phase.date}</div>
                    </div>
                    <Badge label={phase.status.toUpperCase()} color={c} bg={c+"20"}/>
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
              {rel.targetedRegression.map((t,i) => (
                <div key={i} style={{ padding:"10px 14px", background:LIGHT, borderRadius:8, borderLeft:`3px solid ${BLUE}`, fontSize:12, fontWeight:600, color:BLUE }}>
                  🎯 {t}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <STitle>Regression Scope Logic</STitle>
            {[
              { label:"Changed Gosu files mapped to", value:`${rel.gitDiff.gosuFiles} test suites` },
              { label:"PCF changes trigger",          value:`UI regression scope` },
              { label:"Integration changes trigger",  value:`Smoke test suite` },
              { label:"Config changes trigger",       value:`Config validation scripts` },
            ].map(r => (
              <div key={r.label} style={{ padding:"8px 0", borderBottom:"1px solid #F3F4F6", fontSize:12 }}>
                <span style={{ color:GRAY }}>{r.label} </span>
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
              <div key={r.area} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #F3F4F6" }}>
                <span style={{ fontSize:11, color:"#374151" }}>{r.area}</span>
                <span style={{ fontSize:12, fontWeight:800, color:BLUE, fontFamily:MONO }}>{r.hours}h</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", background:LIGHT, borderRadius:7, marginTop:8, paddingLeft:8, paddingRight:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:BLUE }}>Total Estimated</span>
              <span style={{ fontSize:14, fontWeight:900, color:BLUE, fontFamily:MONO }}>
                {Math.round(rel.gitDiff.gosuFiles*0.4) + rel.integrations.length*2 + Math.round(rel.gitDiff.pcfFiles*0.8) + Math.round(rel.gitDiff.configFiles*0.3)}h
              </span>
            </div>
          </Card>
        </div>
      );

      case "ai": return (
        <Card style={{ borderLeft:`4px solid ${BLUE}`, background:LIGHT }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:BLUE, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🤖</div>
            <div>
              <div style={{ fontWeight:800, fontSize:14, color:BLUE }}>AI Release Intelligence</div>
              <div style={{ fontSize:11, color:GRAY }}>Trained on 24 historical releases · {new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>
            </div>
            <div style={{ marginLeft:"auto" }}>
              <div style={{ padding:"4px 12px", background:rcColor, color:"#fff", borderRadius:8, fontWeight:800, fontSize:12 }}>
                {rel.recommendation}
              </div>
            </div>
          </div>
          <div style={{ fontSize:13, color:"#1E3A5F", lineHeight:1.8, background:"#fff", padding:16, borderRadius:10, border:"1px solid #D1D5DB" }}>
            {rel.aiInsight}
          </div>
          <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {[
              { label:"Risk Score",       value:rel.riskScore+"/100",  color:scoreColor(rel.riskScore) },
              { label:"Rollback Prob.",    value:rel.rollbackProb+"%",  color:rel.rollbackProb>25?RED:GREEN },
              { label:"Files Changed",    value:rel.gitDiff.filesChanged, color:BLUE },
            ].map(k => (
              <div key={k.label} style={{ textAlign:"center", padding:"10px 8px", background:"#fff", borderRadius:8, border:"1px solid #E5E7EB" }}>
                <div style={{ fontSize:9, color:GRAY, fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>{k.label}</div>
                <div style={{ fontSize:20, fontWeight:900, color:k.color, fontFamily:MONO }}>{k.value}</div>
              </div>
            ))}
          </div>
        </Card>
      );

      default: return null;
    }
  };

  return (
    <div style={{ fontFamily:SANS, minHeight:"100vh", background:"#F0F2F5" }}>

      {/* Header */}
      <div style={{ background:BLUE, height:56, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ display:"flex", gap:3 }}>
            <div style={{ width:6, height:40, background:RED, borderRadius:2 }}/>
            <div style={{ width:6, height:40, background:"#fff", borderRadius:2 }}/>
          </div>
          <div>
            <div style={{ color:"#fff", fontWeight:900, fontSize:14, letterSpacing:"0.02em" }}>Release Risk Predictor</div>
            <div style={{ color:"rgba(255,255,255,0.55)", fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>Guidewire AMS · Predictive Analytics</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ padding:"3px 12px", background:"rgba(255,255,255,0.12)", borderRadius:16, fontSize:11, color:"#fff", fontWeight:600 }}>
            🚀 {rel.id}
          </div>
          <div style={{ padding:"3px 12px", background:rcColor, borderRadius:16, fontSize:11, color:"#fff", fontWeight:800 }}>
            {rel.recommendation}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:20 }}>

        {/* Release selector */}
        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          {RELEASES.map(r => (
            <div key={r.id} onClick={() => { setSelected(r); setTab("overview"); }}
              style={{ flex:1, padding:"12px 14px", borderRadius:10, cursor:"pointer",
                border:`2px solid ${selected.id===r.id ? BLUE : "#E5E7EB"}`,
                background:selected.id===r.id ? LIGHT : "#fff",
                boxShadow: selected.id===r.id ? `0 4px 12px ${BLUE}20` : "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <div style={{ fontSize:11, fontWeight:800, color:selected.id===r.id?BLUE:"#374151" }}>{r.name}</div>
                <div style={{ fontSize:10, fontWeight:800, color:RISK_COLORS[r.riskBand], background:RISK_BG[r.riskBand], padding:"1px 7px", borderRadius:8 }}>{r.riskBand}</div>
              </div>
              <div style={{ fontSize:10, color:GRAY }}>{r.module} · {r.target}</div>
              <div style={{ marginTop:8, height:4, background:"#E5E7EB", borderRadius:2 }}>
                <div style={{ height:4, width:`${r.riskScore}%`, background:scoreColor(r.riskScore), borderRadius:2 }}/>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:2, fontSize:9, color:GRAY, fontFamily:MONO }}>
                <span>Risk: {r.riskScore}/100</span><span>Rollback: {r.rollbackProb}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sub-tabs */}
        <div style={{ background:"#fff", borderRadius:10, border:"1px solid #E5E7EB", padding:"0 4px", display:"flex", gap:0, marginBottom:16, overflowX:"auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding:"11px 16px", border:"none", background:"none", cursor:"pointer", fontSize:11, fontWeight:700, whiteSpace:"nowrap",
                color:tab===t.id?BLUE:GRAY, borderBottom:tab===t.id?`3px solid ${BLUE}`:"3px solid transparent",
                transition:"all 0.15s", fontFamily:SANS }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {renderTab()}

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:20, fontSize:10, color:GRAY }}>
          Release Risk Predictor · Guidewire AMS · Trained on {rel.historicalReleases} historical releases · Confidential
        </div>
      </div>
    </div>
  );
}
