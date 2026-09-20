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

  const [creatorOpen, setCreatorOpen] = useState(false);
  const [creatorPrompt, setCreatorPrompt] = useState("");
  const [creatingVideo, setCreatingVideo] = useState(false);
  const [createdVideo, setCreatedVideo] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [fragmentWarning, setFragmentWarning] = useState(false);

  async function analyzeMemory() {
    setLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch(
        "https://the-last-memory-backend.onrender.com/generate-memory",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt:
              "Analyze this memory from Mara's archive. The memory contains Mara and her daughter Emma during Emma's childhood. Look for inconsistencies, missing information, emotional anomalies, or signs that part of the memory may have been deliberately removed. Respond as the memory archive system. Be mysterious but concise. Do not use Markdown, asterisks, bullet points, headings, or special formatting. Return clean plain text only.",
          }),
        }
      );

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

  async function createNewMemory() {
    if (!creatorPrompt.trim()) return;

    setCreatingVideo(true);
    setCreatedVideo(null);
    setCreateError(null);

    try {
      const response = await fetch(
        "https://the-last-memory-backend.onrender.com/create-video",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: creatorPrompt,
          }),
        }
      );

      const data = await response.json();

      if (!data.success || !data.video_url) {
        setCreateError(
          data.message || "The Memory Archive could not create the video."
        );
        return;
      }

      setCreatedVideo(data.video_url);
    } catch {
      setCreateError(
        "Unable to connect to the Memory Archive. Please try again."
      );
    } finally {
      setCreatingVideo(false);
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
    setFragmentWarning(false);
  }

  function resetCreator() {
    setCreatorOpen(false);
    setCreatorPrompt("");
    setCreatingVideo(false);
    setCreatedVideo(null);
    setCreateError(null);
  }

  if (reveal) {
    return (
      <main className="min-h-screen bg-[#020308] px-6 text-white">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center py-12">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-blue-300">
              Memory Archive // Restricted Data
            </p>

            <p className="mt-3 text-[10px] uppercase tracking-[0.35em] text-gray-700">
              Unauthorized memory restoration detected
            </p>
          </div>

          <section className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] shadow-2xl shadow-blue-950/20">
            <div className="border-b border-white/10 px-8 py-5 md:px-12">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
                  Archive Response
                </p>

                <span className="text-[10px] uppercase tracking-[0.25em] text-red-300/70">
                  Restricted
                </span>
              </div>
            </div>

            <div className="px-8 py-8 md:px-12 md:py-10">
              <div className="space-y-7 text-lg leading-8">
                <p>
                  <span className="text-gray-500">Mara:</span> Who was she?
                </p>

                <p className="text-blue-200">
                  <span className="text-blue-300/50">Archive:</span> Your
                  memory is incomplete.
                </p>

                <p>
                  <span className="text-gray-500">Mara:</span> Why?
                </p>

                <p className="text-blue-200">
                  <span className="text-blue-300/50">Archive:</span> Some
                  memories were removed.
                </p>
              </div>

              <div className="my-10 h-px bg-white/10" />

              <div className="rounded-xl border border-red-400/20 bg-red-500/[0.035] p-6 md:p-7">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />

                  <p className="text-xs uppercase tracking-[0.3em] text-red-300">
                    Memory Access Restricted
                  </p>
                </div>

                <p className="mt-5 max-w-2xl leading-7 text-gray-400">
                  The archive cannot restore what the user intentionally
                  instructed it to forget.
                </p>

                <div className="mt-7 border-t border-red-400/10 pt-5 font-mono text-[10px] leading-6 tracking-wider text-gray-600">
                  MEMORY DESIGNATION: EMMA
                  <br />
                  STATUS: PARTIALLY DELETED
                  <br />
                  RESTORATION: USER-RESTRICTED
                </div>
              </div>
            </div>
          </section>

          <button
            onClick={resetMemory}
            className="mx-auto mt-8 rounded-full border border-white/10 px-7 py-3 text-sm uppercase tracking-[0.2em] text-gray-500 transition hover:border-white/30 hover:text-white"
          >
            Return to Archive
          </button>
        </div>
      </main>
    );
  }

  if (memory) {
    return (
      <main className="min-h-screen bg-[#030407] text-white">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
          <button
            onClick={resetMemory}
            className="mb-7 w-fit text-sm text-gray-500 transition hover:text-white"
          >
            ← Return to Archive
          </button>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black">
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

              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Livepeer Agent Active
              </div>
            </div>

            <h1 className="mt-4 text-3xl font-light md:text-4xl">
              Something feels familiar.
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-gray-500">
              The archive reconstructed this fragment from Mara&apos;s
              recovered memories. Something inside the reconstruction does
              not belong.
            </p>

            <button
              onClick={analyzeMemory}
              disabled={loading}
              className="mt-8 rounded-full border border-blue-400/40 bg-blue-500/[0.08] px-7 py-3 text-sm uppercase tracking-[0.2em] text-blue-200 transition hover:border-blue-300 hover:bg-blue-500/[0.15] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analyzing Memory..." : "Analyze Memory"}
            </button>

            {loading && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-blue-400/20 bg-blue-500/[0.035] p-6">
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
                <div className="mt-8 rounded-2xl border border-blue-400/20 bg-blue-500/[0.04] p-6 md:p-7">
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
                    <div className="mt-7 border-t border-white/10 pt-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-600">
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

                        <div className="rounded-lg border border-red-400/20 bg-red-500/[0.03] p-3">
                          <span className="text-red-400">●</span>{" "}
                          ANOMALY DETECTED
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {analysis.success && (
                  <button
                    onClick={() => setReveal(true)}
                    className="mt-6 rounded-full border border-red-400/40 bg-red-500/[0.08] px-7 py-3 text-sm uppercase tracking-[0.2em] text-red-200 transition hover:border-red-300 hover:bg-red-500/[0.15]"
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
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#03050a] px-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(70,100,255,0.15),transparent_38%)]" />

        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/[0.04]" />

        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/[0.025]" />

        <section className="relative z-10 max-w-3xl text-center">
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-blue-400/30" />

            <p className="text-[10px] uppercase tracking-[0.5em] text-blue-300">
              Memory Archive // System Online
            </p>

            <span className="h-px w-10 bg-blue-400/30" />
          </div>

          <h1 className="text-6xl font-light tracking-tight md:text-8xl">
            The Last Memory
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-lg leading-8 text-gray-400">
            An interactive memory reconstruction experience powered by
            generative media and Livepeer Agent.
          </p>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-gray-600">
            Explore Mara&apos;s recovered memories.
            <br />
            Discover what the archive has forgotten.
          </p>

          <button
            onClick={() => setEntered(true)}
            className="mt-12 rounded-full border border-blue-400/40 bg-blue-500/[0.08] px-8 py-4 text-sm uppercase tracking-[0.25em] text-blue-200 shadow-lg shadow-blue-950/20 transition hover:border-blue-300 hover:bg-blue-500/[0.15]"
          >
            Enter Memory Archive
          </button>

          <div className="mt-9 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Livepeer Agent Connected
          </div>
        </section>
      </main>
    );
  }

  if (creatorOpen) {
    return (
      <main className="min-h-screen bg-[#05070d] px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={resetCreator}
            className="text-sm text-gray-500 transition hover:text-white"
          >
            ← Return to Archive
          </button>

          <section className="mt-12">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-blue-400" />

              <p className="text-xs uppercase tracking-[0.4em] text-blue-300">
                Livepeer Agent // Memory Creator
              </p>
            </div>

            <h1 className="mt-5 text-4xl font-light md:text-5xl">
              Create Your Own Memory
            </h1>

            <p className="mt-5 max-w-2xl leading-7 text-gray-500">
              Give the archive a moment from your imagination. It will
              generate the visual memory and animate it into a short
              cinematic reconstruction.
            </p>

            {!createdVideo && !creatingVideo && (
              <>
                <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
                  <div className="border-b border-white/10 px-5 py-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600">
                      Memory Input
                    </p>
                  </div>

                  <textarea
                    value={creatorPrompt}
                    onChange={(e) => setCreatorPrompt(e.target.value)}
                    placeholder="Describe the memory you want to create..."
                    rows={7}
                    className="w-full resize-none bg-transparent p-6 text-gray-200 outline-none placeholder:text-gray-700"
                  />
                </div>

                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-gray-600">
                      5-second cinematic reconstruction
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-700">
                      Generated by Livepeer Agent
                    </p>
                  </div>

                  <button
                    onClick={createNewMemory}
                    disabled={!creatorPrompt.trim()}
                    className="rounded-full border border-blue-400/40 bg-blue-500/[0.08] px-8 py-4 text-sm uppercase tracking-[0.2em] text-blue-200 transition hover:border-blue-300 hover:bg-blue-500/[0.15] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Generate Memory →
                  </button>
                </div>
              </>
            )}

            {creatingVideo && (
              <div className="mt-10 rounded-2xl border border-blue-400/20 bg-blue-500/[0.035] p-8">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-blue-300">
                    Livepeer Agent // Creating Memory
                  </p>

                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                </div>

                <div className="mt-7 space-y-4 font-mono text-xs">
                  <p className="text-green-400">
                    ● MEMORY IDEA RECEIVED
                  </p>

                  <p className="text-blue-300">
                    ● GENERATING MEMORY VISUAL
                  </p>

                  <p className="text-blue-300">
                    ● ANIMATING MEMORY
                  </p>

                  <p className="animate-pulse text-gray-400">
                    ● AGENT PROCESSING...
                  </p>
                </div>

                <p className="mt-7 text-sm leading-6 text-gray-600">
                  The Agent is creating and animating your memory. This can
                  take up to a minute.
                </p>
              </div>
            )}

            {createError && (
              <div className="mt-8 rounded-xl border border-red-400/20 bg-red-500/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-red-300">
                  Memory Creation Failed
                </p>

                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {createError}
                </p>

                <button
                  onClick={() => setCreateError(null)}
                  className="mt-5 text-xs uppercase tracking-[0.2em] text-red-300 hover:text-red-200"
                >
                  Try Again
                </button>
              </div>
            )}

            {createdVideo && (
              <div className="mt-10">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
                  <video
                    className="w-full"
                    src={createdVideo}
                    controls
                    autoPlay
                    playsInline
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-500/[0.035] p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs uppercase tracking-[0.3em] text-green-300">
                      Livepeer Agent // Memory Created
                    </p>

                    <span className="text-xs text-green-400">
                      ● COMPLETE
                    </span>
                  </div>

                  <p className="mt-4 leading-7 text-gray-400">
                    Your idea has been reconstructed into cinematic media by
                    the Memory Archive.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => {
                      setCreatedVideo(null);
                      setCreatorPrompt("");
                    }}
                    className="rounded-full border border-blue-400/40 bg-blue-500/[0.08] px-7 py-3 text-sm uppercase tracking-[0.2em] text-blue-200 transition hover:border-blue-300 hover:bg-blue-500/[0.15]"
                  >
                    Create Another
                  </button>

                  <button
                    onClick={resetCreator}
                    className="rounded-full border border-white/10 px-7 py-3 text-sm uppercase tracking-[0.2em] text-gray-500 transition hover:border-white/30 hover:text-white"
                  >
                    Return to Archive
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
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
            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-600">
              System Status
            </p>

            <div className="mt-1 flex items-center justify-end gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

              <p className="text-sm text-green-400">ONLINE</p>
            </div>

            <p className="mt-1 text-[9px] uppercase tracking-widest text-gray-700">
              Livepeer Agent Connected
            </p>
          </div>
        </header>

        <section className="py-16">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-600">
              Available Memories
            </p>

            <h2 className="mt-4 text-3xl font-light md:text-4xl">
              What remains of the past?
            </h2>

            <p className="mt-4 leading-7 text-gray-500">
              Select a memory fragment to begin reconstruction. The archive
              will analyze recovered material for anomalies and missing data.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <button
              onClick={() => setMemory("/videos/scene-1.mp4")}
              className="group overflow-hidden rounded-2xl border border-blue-400/20 bg-blue-500/[0.025] text-left transition hover:-translate-y-1 hover:border-blue-400/50 hover:bg-blue-500/[0.06]"
            >
              <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950/80 via-blue-950/20 to-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(100,130,255,0.18),transparent_55%)]" />

                <span className="relative text-4xl text-blue-200/50 transition group-hover:text-blue-200/80">
                  ◈
                </span>

                <span className="absolute left-4 top-4 text-[9px] uppercase tracking-[0.25em] text-blue-300/50">
                  FRAGMENT 001
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg">The Archive</h2>

                  <span className="text-xs text-green-400">STABLE</span>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  Memory fragment // Entry
                </p>

                <p className="mt-5 text-xs uppercase tracking-[0.2em] text-blue-300 opacity-0 transition group-hover:opacity-100">
                  Reconstruct →
                </p>
              </div>
            </button>

            <button
              onClick={() => setMemory("/videos/scene-2.mp4")}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] text-left transition hover:-translate-y-1 hover:border-blue-400/50 hover:bg-blue-500/[0.06]"
            >
              <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-amber-950/60 via-amber-950/10 to-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,190,100,0.12),transparent_55%)]" />

                <span className="relative text-4xl text-amber-100/40 transition group-hover:text-amber-100/70">
                  ◈
                </span>

                <span className="absolute left-4 top-4 text-[9px] uppercase tracking-[0.25em] text-amber-200/40">
                  FRAGMENT 002
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg">Emma — Childhood</h2>

                  <span className="text-xs text-green-400">STABLE</span>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  Memory fragment // Age 8
                </p>

                <p className="mt-5 text-xs uppercase tracking-[0.2em] text-blue-300 opacity-0 transition group-hover:opacity-100">
                  Reconstruct →
                </p>
              </div>
            </button>

            <button
              onClick={() => setFragmentWarning(true)}
              className="group overflow-hidden rounded-2xl border border-red-400/15 bg-red-500/[0.025] text-left transition hover:-translate-y-1 hover:border-red-400/40"
            >
              <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-red-950/40 via-red-950/10 to-black">
                <span className="relative text-4xl text-red-200/40 transition group-hover:text-red-200/70">
                  ?
                </span>

                <span className="absolute left-4 top-4 text-[9px] uppercase tracking-[0.25em] text-red-300/40">
                  FRAGMENT 003
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg">Unknown Fragment</h2>

                  <span className="text-xs text-red-400">CORRUPTED</span>
                </div>

                <p className="mt-2 text-sm text-red-300/50">
                  Memory integrity compromised
                </p>

                <p className="mt-5 text-xs uppercase tracking-[0.2em] text-red-300 opacity-0 transition group-hover:opacity-100">
                  Inspect →
                </p>
              </div>
            </button>
          </div>

          {fragmentWarning && (
            <div className="mt-6 rounded-xl border border-red-400/20 bg-red-500/[0.035] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-red-300">
                    Archive Warning
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Memory integrity compromised. Reconstruction unavailable.
                  </p>
                </div>

                <button
                  onClick={() => setFragmentWarning(false)}
                  className="w-fit text-xs uppercase tracking-[0.2em] text-gray-600 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setCreatorOpen(true)}
            className="group mt-8 w-full rounded-2xl border border-blue-400/25 bg-gradient-to-r from-blue-500/[0.07] to-transparent p-7 text-left transition hover:border-blue-300/50 hover:bg-blue-500/[0.1]"
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                  <p className="text-[10px] uppercase tracking-[0.35em] text-blue-300">
                    Create With Livepeer Agent
                  </p>
                </div>

                <h2 className="mt-3 text-xl font-light">
                  Create Your Own Memory
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                  Describe a moment from your imagination and transform it
                  into a cinematic memory.
                </p>
              </div>

              <span className="whitespace-nowrap rounded-full border border-blue-400/40 px-6 py-3 text-xs uppercase tracking-[0.2em] text-blue-200 transition group-hover:border-blue-300">
                Create Memory →
              </span>
            </div>
          </button>

          <div className="mt-12 rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex flex-col gap-3 text-xs md:flex-row md:items-center md:justify-between">
              <span className="uppercase tracking-[0.3em] text-gray-600">
                Media Intelligence Layer
              </span>

              <span className="text-green-400">
                ● LIVEPEER AGENT ACTIVE
              </span>
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
              Livepeer Agent analyzes recovered memory context and transforms
              new user ideas into generated cinematic media.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}