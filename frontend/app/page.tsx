"use client";

import { useState } from "react";

type Analysis = {
  analysis?: string;
  success?: boolean;
  message?: string;
};

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [memory, setMemory] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [reveal, setReveal] = useState(false);

  async function analyzeMemory() {
    setLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch("http://the-last-memory-backend.onrender.com/generate-memory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt:
            "Analyze this memory from Mara's archive. The memory contains Mara and her daughter Emma during Emma's childhood. Look for inconsistencies, missing information, emotional anomalies, or signs that part of the memory may have been deliberately removed. Respond as the memory archive system. Be mysterious but concise. Do not use Markdown, asterisks, bullet points, headings, or special formatting. Return clean plain text only.",
        }),
      });

      const data = await response.json();
      setAnalysis(data);
    } catch {
      setAnalysis({
        success: false,
        message: "Unable to connect to the Memory Archive.",
      });
    } finally {
      setLoading(false);
    }
  }

  function cleanAnalysis(text: string) {
    return text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/^[-•]\s*/gm, "")
      .replace(/^#+\s*/gm, "")
      .trim();
  }

  function resetMemory() {
    setMemory(null);
    setAnalysis(null);
    setReveal(false);
  }

  if (reveal) {
    return (
      <main className="min-h-screen bg-[#020308] px-6 text-white">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center py-12">
          <p className="text-center text-xs uppercase tracking-[0.5em] text-blue-300">
            Memory Archive // Restricted Data
          </p>

          <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-12">
            <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
              ARCHIVE RESPONSE
            </p>

            <div className="mt-8 space-y-7 text-lg leading-8">
              <p>Mara: Who was she?</p>

              <p className="text-blue-200">
                Archive: Your memory is incomplete.
              </p>

              <p>Mara: Why?</p>

              <p className="text-blue-200">
                Archive: Some memories were removed.
              </p>
            </div>

            <div className="my-10 h-px bg-white/10" />

            <div className="rounded-xl border border-red-400/20 bg-red-500/[0.04] p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-red-300">
                MEMORY ACCESS RESTRICTED
              </p>

              <p className="mt-4 leading-7 text-gray-400">
                The archive cannot restore what the user intentionally
                instructed it to forget.
              </p>

              <div className="mt-6 text-xs leading-6 text-gray-600">
                MEMORY DESIGNATION: EMMA
                <br />
                STATUS: PARTIALLY DELETED
              </div>
            </div>
          </section>

          <button
            onClick={resetMemory}
            className="mx-auto mt-8 rounded-full border border-white/10 px-7 py-3 text-sm uppercase tracking-[0.2em] text-gray-400 transition hover:border-white/30 hover:text-white"
          >
            Return to Archive
          </button>
        </div>
      </main>
    );
  }

  if (memory) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
          <button
            onClick={resetMemory}
            className="mb-6 w-fit text-sm text-gray-400 hover:text-white"
          >
            ← Return to Archive
          </button>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <video
              className="w-full"
              src={memory}
              controls
              autoPlay
              playsInline
            />
          </div>

          <div className="mt-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-xs uppercase tracking-[0.4em] text-blue-300">
                Memory Reconstruction
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Powered by Livepeer Agent
              </div>
            </div>

            <h1 className="mt-3 text-3xl font-light">
              Something feels familiar.
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-gray-400">
              Explore the recovered memory. The archive has detected
              inconsistencies within the reconstruction.
            </p>

            <button
              onClick={analyzeMemory}
              disabled={loading}
              className="mt-8 rounded-full border border-blue-400/40 bg-blue-500/10 px-7 py-3 text-sm uppercase tracking-[0.2em] text-blue-200 transition hover:border-blue-300 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analyzing Memory..." : "Analyze Memory"}
            </button>

            {loading && (
              <div className="mt-8 rounded-2xl border border-blue-400/20 bg-blue-500/[0.04] p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-300">
                  Livepeer Agent // Processing
                </p>

                <div className="mt-5 space-y-3 font-mono text-xs">
                  <p className="text-green-400">
                    ● MEMORY INPUT RECEIVED
                  </p>

                  <p className="text-blue-300">
                    ● ANALYSIS REQUESTED
                  </p>

                  <p className="animate-pulse text-gray-400">
                    ● AGENT PROCESSING...
                  </p>
                </div>
              </div>
            )}

            {analysis && (
              <>
                <div className="mt-8 rounded-2xl border border-blue-400/20 bg-blue-500/[0.05] p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-300">
                      Livepeer Agent // Memory Analysis
                    </p>

                    {analysis.success && (
                      <p className="text-xs text-green-400">
                        ● AGENT RESPONSE RECEIVED
                      </p>
                    )}
                  </div>

                  <div className="mt-5 whitespace-pre-wrap leading-7 text-gray-300">
                    {analysis.analysis
                      ? cleanAnalysis(analysis.analysis)
                      : analysis.message ||
                        JSON.stringify(analysis, null, 2)}
                  </div>

                  {analysis.success && (
                    <div className="mt-6 border-t border-white/10 pt-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                        Agent Activity
                      </p>

                      <div className="mt-4 grid gap-3 text-xs font-mono md:grid-cols-3">
                        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                          <span className="text-green-400">●</span>{" "}
                          MEMORY RECEIVED
                        </div>

                        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                          <span className="text-green-400">●</span>{" "}
                          ANALYSIS COMPLETE
                        </div>

                        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                          <span className="text-green-400">●</span>{" "}
                          ANOMALY DETECTED
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {analysis.success && (
                  <button
                    onClick={() => setReveal(true)}
                    className="mt-6 rounded-full border border-red-400/40 bg-red-500/10 px-7 py-3 text-sm uppercase tracking-[0.2em] text-red-200 transition hover:border-red-300 hover:bg-red-500/20"
                  >
                    Ask the Archive: Who Was She?
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (!entered) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05070d] px-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(90,120,255,0.16),transparent_45%)]" />

        <section className="relative z-10 max-w-3xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-blue-300">
            Memory Archive // System Online
          </p>

          <h1 className="text-6xl font-light tracking-tight md:text-8xl">
            The Last Memory
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-lg leading-8 text-gray-400">
            An interactive memory reconstruction experience powered by
            generative media and Livepeer Agent.
          </p>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-gray-600">
            Explore Mara&apos;s recovered memories. Discover what the archive
            has forgotten.
          </p>

          <button
            onClick={() => setEntered(true)}
            className="mt-12 rounded-full border border-blue-400/40 bg-blue-500/10 px-8 py-4 text-sm uppercase tracking-[0.25em] text-blue-200 transition hover:border-blue-300 hover:bg-blue-500/20"
          >
            Enter Memory Archive
          </button>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-600">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Livepeer Agent Connected
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05070d] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-blue-300">
              Memory Archive
            </p>

            <h1 className="mt-2 text-2xl font-light">
              Mara&apos;s Memories
            </h1>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">SYSTEM STATUS</p>

            <p className="mt-1 text-sm text-green-400">
              ONLINE
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-widest text-gray-600">
              Livepeer Agent Connected
            </p>
          </div>
        </header>

        <section className="py-16">
          <div className="max-w-2xl">
            <p className="text-sm text-gray-500">
              AVAILABLE MEMORIES
            </p>

            <h2 className="mt-3 text-3xl font-light">
              What remains of the past?
            </h2>

            <p className="mt-4 leading-7 text-gray-500">
              Select a memory fragment to begin reconstruction. The archive
              will analyze the recovered material for anomalies.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <button
              onClick={() => setMemory("/videos/scene-1.mp4")}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition hover:border-blue-400/50 hover:bg-blue-500/[0.06]"
            >
              <div className="flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-blue-950 to-black">
                <span className="text-4xl opacity-60">◈</span>
              </div>

              <h2 className="mt-5 text-lg">
                The Archive
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Memory fragment // Entry
              </p>
            </button>

            <button
              onClick={() => setMemory("/videos/scene-2.mp4")}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition hover:border-blue-400/50 hover:bg-blue-500/[0.06]"
            >
              <div className="flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-amber-950/60 to-black">
                <span className="text-4xl opacity-60">◈</span>
              </div>

              <h2 className="mt-5 text-lg">
                Emma — Childhood
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Memory fragment // Age 8
              </p>
            </button>

            <button
              onClick={() => alert("Memory integrity compromised.")}
              className="group rounded-2xl border border-red-400/20 bg-red-500/[0.03] p-6 text-left transition hover:border-red-400/50"
            >
              <div className="flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-red-950/40 to-black">
                <span className="text-4xl opacity-60">?</span>
              </div>

              <h2 className="mt-5 text-lg">
                Unknown Fragment
              </h2>

              <p className="mt-2 text-sm text-red-300/60">
                Memory integrity compromised
              </p>
            </button>
          </div>

          <div className="mt-12 rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex flex-col gap-3 text-xs md:flex-row md:items-center md:justify-between">
              <span className="uppercase tracking-[0.3em] text-gray-500">
                Media Intelligence Layer
              </span>

              <span className="text-green-400">
                ● LIVEPEER AGENT ACTIVE
              </span>
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
              Livepeer Agent analyzes recovered memory context and returns
              an interpretation that becomes part of the interactive story.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}