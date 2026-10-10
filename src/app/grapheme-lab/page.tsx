"use client";

/**
 * Grapheme visual registry review tool (PixelPerfect spec §15/§21 Phase 4).
 * Dev/preview route, intentionally unlinked from navigation: renders every
 * curated family × typing stage through the production renderer, with the
 * resolved plan, classes and per-layout key plans beside each cell.
 *
 * URL: /grapheme-lab
 */

import * as React from "react";
import { useMemo } from "react";
import { GraphemeDisplay } from "@/components/lessons/GraphemeDisplay";
import { ConjunctSimulationBox } from "@/components/lessons/ConjunctSimulationBox";
import {
  buildGraphemeRenderModel,
  normalizeBengaliString,
} from "@/lib/bengali-grapheme";
import { getRenderPlan, getTypingPlan } from "@/lib/grapheme-visual/plan";
import { collectCorpusConjuncts } from "@/lib/grapheme-visual/corpus";

const FIXTURES: string[] = [
  "ক",
  "কা",
  "টি",
  "ঠি",
  "ডি",
  "ঢি",
  "ক্",
  "ক্ল",
  "ক্লা",
  "ট্ট",
  "প্ত",
  "প্র",
  "ট্র",
  "দ্র",
  "ব্র",
  "গ্র",
  "স্র",
  "ফ্র",
  "হ্র",
  "দ্ব",
  "শ্ব",
  "ত্ব",
  "ন্ব",
  "জ্ব",
  "স্বা",
  "ক্র",
  "ক্ত",
  "ক্ষ",
  "ক্ষ্ম",
  "র্ক",
  "র্ম",
  "ক্য",
  "ক্ক",
  "স্ত্র",
  "০",
  "।",
];

const KEY_PLAN_TARGETS = ["ক্ষ", "ক্ল", "জ্ঞ", "ক্ক"];
const KEY_PLAN_LAYOUTS = ["banglaword", "avro", "bijoy", "probhat", "unijoy"];

function stagesFor(target: string): string[] {
  const units = Array.from(normalizeBengaliString(target));
  const stages = ["", units[0] ?? "", units.slice(0, 2).join(""), target];
  return [...new Set(stages)].slice(0, 4);
}

export default function GraphemeLabPage() {
  const histogram = useMemo(() => {
    const hist: Record<string, number> = {};
    for (const { cluster } of collectCorpusConjuncts()) {
      const s = getRenderPlan(cluster).strategy;
      hist[s] = (hist[s] ?? 0) + 1;
    }
    return hist;
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 sm:p-10 space-y-10">
      <header className="max-w-5xl mx-auto space-y-2">
        <h1 className="text-2xl font-bold">Grapheme visual registry lab</h1>
        <p className="text-sm text-muted-foreground">
          Production renderer × resolved plan × typing stages. Corpus strategy histogram:{" "}
          {Object.entries(histogram)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" · ")}
        </p>
      </header>

      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FIXTURES.map((target) => {
          const plan = getRenderPlan(target);
          return (
            <div
              key={target}
              className="rounded-2xl border bg-card p-4 space-y-3"
              data-testid="gv-fixture"
              data-grapheme={target}
              data-strategy={plan.strategy}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-lg font-bold">{target || "∅"}</span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {plan.strategy} · {plan.spec.classes.join("+")}
                </span>
              </div>
              <div className="flex items-end justify-center gap-4 flex-wrap">
                {stagesFor(target).map((typed, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1"
                    data-testid="gv-cell"
                    data-grapheme={target}
                    data-stage={typed}
                    data-strategy={plan.strategy}
                  >
                    <div className="rounded-xl bg-secondary/60 border px-4 py-2">
                      <span className="text-4xl font-black font-headline">
                        <GraphemeDisplay
                          model={buildGraphemeRenderModel(target, typed)}
                          showSimulationBox={false}
                        />
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {typed || "∅"}
                    </span>
                  </div>
                ))}
              </div>
              {plan.showSimBox && (
                <div className="flex justify-center">
                  <ConjunctSimulationBox
                    model={buildGraphemeRenderModel(
                      target,
                      stagesFor(target)[2] ?? "",
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </section>

      <section className="max-w-5xl mx-auto rounded-2xl border bg-card p-4 space-y-3">
        <h2 className="text-lg font-bold">Key plans per layout (§16.4)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-1 pr-4">grapheme</th>
                {KEY_PLAN_LAYOUTS.map((l) => (
                  <th key={l} className="py-1 pr-4 font-mono text-xs">
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {KEY_PLAN_TARGETS.map((g) => (
                <tr key={g} className="border-t border-border/60">
                  <td className="py-1 pr-4 font-bold">{g}</td>
                  {KEY_PLAN_LAYOUTS.map((l) => {
                    const p = getTypingPlan(g, l);
                    return (
                      <td key={l} className="py-1 pr-4 font-mono text-xs">
                        {p.isSupported
                          ? p.keys.map((k) => (k.needsShift ? `S+${k.key}` : k.key)).join(" ")
                          : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
