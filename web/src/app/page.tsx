"use client";

import { useState } from "react";
import CollectionPanel from "@/components/CollectionPanel";
import FeaturePanel from "@/components/FeaturePanel";
import Hero from "@/components/Hero";
import InsightPanel from "@/components/InsightPanel";
import ReferenceShelf from "@/components/ReferenceShelf";
import StatePanel from "@/components/StatePanel";
import StatsStrip from "@/components/StatsStrip";
import WorkspacePanel from "@/components/WorkspacePanel";
import { createInsights, createPlan } from "@/lib/api";

const APP_NAME = "DrillCanvas";
const TAGLINE = "Instantly turn your exam details into a printable, paper\u2011like study notebook.";
const FEATURE_CHIPS = ["Dynamic Exam & Topic Dashboard - Keyboard\u2011first form with autocomplete subject list, calendar picker, and chip\u2011style weak\u2011topic tags; supports multi\u2011subject entry and instant validation.", "Weekly Capacity Planner - Slider that visualizes available study hours per week and shows a preview of how many sprint cards will be generated for each week.", "Deterministic Spread Generator - Pure\u2011function algorithm (run in a WebWorker) that instantly renders a two\u2011page notebook spread with sprint cards, spaced\u2011review checkpoint badges, and binder\u2011tab day columns; identical inputs always produce identical spreads.", "Drag\u2011Drop Syllabus Library - Collapsible sidebar with hand\u2011drawn topic tiles; dragging a tile into the weak\u2011topic pane instantly adds the topic and re\u2011calculates the spread without a full reload."];
const PROOF_POINTS = ["Sample AP Biology and GCSE Maths study spreads displayed in the gallery.", "Student testimonial: \"I stopped procrastinating and felt organized\" \u2013 Maya, 17.", "Citation of Kornell (2009) on spaced\u2011review effectiveness shown in the research summary.", "Open\u2011source GitHub repo linking to the deterministic generation algorithm."];
const SURFACE_LABELS = {"hero": "paper notebook with binder\u2011tab dividers and hand\u2011drawn sticky notes", "workspace": "Input Dashboard \u2013 top\u2011center panel with subject, exam date, weak\u2011topic chips, and weekly capacity slider.", "result": "Generated Revision Spread \u2013 large centered two\u2011page preview that shows sprint cards, checkpoints, and binder tabs.", "support": "Sample Study Plans Gallery", "collection": "Syllabus Library Sidebar \u2013 collapsible right pane with draggable topic tiles."};
const PLACEHOLDERS = {"query": "Exam & Study Details", "preferences": "Study Preferences"};
const DEFAULT_STATS = [{"label": "Two\u2011Page Notebook Spread", "value": "7"}, {"label": "Sample Study Plans Gallery", "value": "0"}, {"label": "Readiness score", "value": "88"}];
const READY_TITLE = "User types \u201cBiology \u2013 12\u202fMay \u2013 weak: cell respiration\u201d + 5\u202fh/week \u2192 the spread appears in <300\u202fms, with the weak topic automatically highlighted on a sprint card.";
const READY_DETAIL = "Live demo: type \"Biology \u2013 Exam 12/05 \u2013 weak: cell respiration\" and set 5\u202fh/week \u2192 watch the spread populate, highlighting the weak topic on a sprint card, inserting spaced\u2011review checkpoints, and creating tabbed day columns for the coming weeks. / User types \u201cBiology \u2013 12\u202fMay \u2013 weak: cell respiration\u201d + 5\u202fh/week \u2192 the spread appears in <300\u202fms, with the weak topic automatically highlighted on a sprint card. / Hovering a syllabus tile and dragging it into the weak\u2011topic pane instantly adds a new bullet and re\u2011calculates sprint distribution.";
const COLLECTION_TITLE = "Paper Notebook With Binder\u2011Tab Dividers And Hand\u2011Drawn Sticky Notes stays visible after each run.";
const SUPPORT_TITLE = "Sample Study Plans Gallery";
const REFERENCE_TITLE = "Binder\u2011Tab Bar \u2013 Vertical Tab Navigation On The Left Side Of The Spread For Quick Week/Day Jumps.";
const BUTTON_LABEL = "Generate Spread";
type LayoutKind = "storyboard" | "operations_console" | "studio" | "atlas" | "notebook" | "lab";
const LAYOUT: LayoutKind = "notebook";
const UI_COPY_TONE = "Friendly, studious \u2013 like a helpful classmate";
const SAMPLE_ITEMS = ["{'subject': 'Biology', 'examDate': '2025-05-12', 'weakTopics': ['cell respiration', 'photosynthesis'], 'weeklyCapacityHours': 5}", "{'subject': 'Mathematics', 'examDate': '2025-06-01', 'weakTopics': ['integration techniques', 'probability theory'], 'weeklyCapacityHours': 4}", "{'subject': 'History', 'examDate': '2025-05-20', 'weakTopics': ['World War II timeline'], 'weeklyCapacityHours': 3}"];
const REFERENCE_OBJECTS = ["spread preview (two\u2011page notebook view)", "sprint card", "spaced\u2011review checkpoint badge", "tab divider", "syllabus topic tile"];

type PlanItem = { title: string; detail: string; score: number };
type InsightPayload = { insights: string[]; next_actions: string[]; highlights: string[] };
type PlanPayload = { summary: string; score: number; items: PlanItem[]; insights?: InsightPayload };

export default function Page() {
  const [query, setQuery] = useState("");
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<PlanPayload | null>(null);
  const [saved, setSaved] = useState<PlanPayload[]>([]);
  const layoutClass = LAYOUT.replace(/_/g, "-");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const nextPlan = await createPlan({ query, preferences });
      const insightPayload = await createInsights({
        selection: nextPlan.items?.[0]?.title ?? query,
        context: preferences || query,
      });
      const composed = { ...nextPlan, insights: insightPayload };
      setPlan(composed);
      setSaved((previous) => [composed, ...previous].slice(0, 4));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const stats = DEFAULT_STATS.map((stat, index) => {
    if (index === 0) return { ...stat, value: String(FEATURE_CHIPS.length) };
    if (index === 1) return { ...stat, value: String(saved.length) };
    if (index === 2) return { ...stat, value: plan ? String(plan.score) : stat.value };
    return stat;
  });

  const heroNode = (
    <Hero
      appName={APP_NAME}
      tagline={TAGLINE}
      proofPoints={PROOF_POINTS}
      eyebrow={SURFACE_LABELS.hero}
    />
  );
  const statsNode = <StatsStrip stats={stats} />;
  const workspaceNode = (
    <WorkspacePanel
      query={query}
      preferences={preferences}
      onQueryChange={setQuery}
      onPreferencesChange={setPreferences}
      onGenerate={handleGenerate}
      loading={loading}
      features={FEATURE_CHIPS}
      eyebrow={SURFACE_LABELS.workspace}
      queryPlaceholder={PLACEHOLDERS.query}
      preferencesPlaceholder={PLACEHOLDERS.preferences}
      actionLabel={BUTTON_LABEL}
    />
  );
  const primaryNode = error ? (
    <StatePanel eyebrow="Request blocked" title="Request blocked" tone="error" detail={error} />
  ) : plan ? (
    <InsightPanel plan={plan} eyebrow={SURFACE_LABELS.result} />
  ) : (
    <StatePanel eyebrow={SURFACE_LABELS.result} title={READY_TITLE} tone="neutral" detail={READY_DETAIL} />
  );
  const featureNode = (
    <FeaturePanel eyebrow={SURFACE_LABELS.support} title={SUPPORT_TITLE} features={FEATURE_CHIPS} proofPoints={PROOF_POINTS} />
  );
  const collectionNode = <CollectionPanel eyebrow={SURFACE_LABELS.collection} title={COLLECTION_TITLE} saved={saved} />;
  const referenceNode = (
    <ReferenceShelf
      eyebrow={SURFACE_LABELS.support}
      title={REFERENCE_TITLE}
      items={SAMPLE_ITEMS}
      objects={REFERENCE_OBJECTS}
      tone={UI_COPY_TONE}
    />
  );

  function renderLayout() {
    if (LAYOUT === "storyboard") {
      return (
        <>
          {heroNode}
          {statsNode}
          <section className="storyboard-stage">
            <div className="storyboard-main">
              {workspaceNode}
              {primaryNode}
            </div>
            <div className="storyboard-side">
              {referenceNode}
              {featureNode}
            </div>
          </section>
          {collectionNode}
        </>
      );
    }

    if (LAYOUT === "operations_console") {
      return (
        <section className="console-shell">
          <div className="console-top">
            {heroNode}
            {statsNode}
          </div>
          <div className="console-grid">
            <div className="console-operator-lane">
              {workspaceNode}
              {referenceNode}
            </div>
            <div className="console-timeline-lane">{primaryNode}</div>
            <div className="console-support-lane">
              {featureNode}
              {collectionNode}
            </div>
          </div>
        </section>
      );
    }

    if (LAYOUT === "studio") {
      return (
        <section className="studio-shell">
          <div className="studio-top">
            {heroNode}
            {primaryNode}
          </div>
          {statsNode}
          <div className="studio-bottom">
            <div className="studio-left">
              {workspaceNode}
              {collectionNode}
            </div>
            <div className="studio-right">
              {referenceNode}
              {featureNode}
            </div>
          </div>
        </section>
      );
    }

    if (LAYOUT === "atlas") {
      return (
        <section className="atlas-shell">
          <div className="atlas-hero-row">
            {heroNode}
            <div className="atlas-side-stack">
              {statsNode}
              {referenceNode}
            </div>
          </div>
          <div className="atlas-main-row">
            <div className="atlas-primary-stack">
              {primaryNode}
              {collectionNode}
            </div>
            <div className="atlas-secondary-stack">
              {workspaceNode}
              {featureNode}
            </div>
          </div>
        </section>
      );
    }

    if (LAYOUT === "notebook") {
      return (
        <section className="notebook-shell">
          {heroNode}
          <div className="notebook-top">
            <div className="notebook-left">
              {primaryNode}
              {referenceNode}
            </div>
            <div className="notebook-right">
              {workspaceNode}
              {featureNode}
            </div>
          </div>
          <div className="notebook-bottom">
            {collectionNode}
            {statsNode}
          </div>
        </section>
      );
    }

    return (
      <>
        {heroNode}
        {statsNode}
        <section className="content-grid">
          {workspaceNode}
          <div className="stack">
            {primaryNode}
            {referenceNode}
            {featureNode}
          </div>
        </section>
        {collectionNode}
      </>
    );
  }

  return (
    <main className={`page-shell layout-${layoutClass}`}>
      {renderLayout()}
    </main>
  );
}
