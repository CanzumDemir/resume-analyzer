// AI assistance disclosure: AI tools assisted with frontend UI implementation,
// styling, Tailwind CSS, layout, and implementation details during development.
// Exact historical line-level provenance is unavailable; see AI_ASSISTANCE.md.

import Link from "next/link";

import AppLogo from "@/components/AppLogo";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <header className="border-b border-gray-800/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <AppLogo />

          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
          {/* Hero Text */}
          <div>
            <div className="mb-6 inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
              AI-powered resume analysis
            </div>

            <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
              Understand how strong your resume{" "}
              <span className="text-blue-500">really is.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              Analyze your resume against a job description, uncover missing
              keywords, evaluate ATS readiness and get concrete recommendations
              to improve your application.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Analyze your resume
              </Link>

              <Link
                href="/login"
                className="rounded-xl border border-gray-700 bg-gray-900 px-6 py-3 text-sm font-semibold text-gray-300 transition hover:border-gray-600 hover:bg-gray-800 hover:text-white"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-500">
              <span>ATS analysis</span>
              <span>Job matching</span>
              <span>Actionable feedback</span>
            </div>
          </div>

          {/* Product Preview */}
          <div className="relative">
            <div className="rounded-3xl border border-gray-800 bg-gray-900/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Resume Analysis
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    Junior Backend Developer
                  </h2>
                </div>

                <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                <PreviewScore
                  title="Overall Score"
                  score={82}
                />

                <PreviewScore
                  title="ATS Score"
                  score={88}
                />
              </div>

              {/* Section Scores */}
              <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-950/60 p-5">
                <p className="mb-5 text-sm font-semibold">
                  Section Scores
                </p>

                <ScoreRow
                  label="Experience Match"
                  score={78}
                />

                <ScoreRow
                  label="Hard Skills"
                  score={91}
                />

                <ScoreRow
                  label="Achievements"
                  score={64}
                />

                <ScoreRow
                  label="Resume Quality"
                  score={85}
                />
              </div>

              {/* Insight */}
              <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-950/60 p-5">
                <p className="text-sm font-semibold">
                  Key Insight
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Strong technical foundation with{" "}
                  <span className="font-semibold text-gray-200">
                    Python, FastAPI and Docker
                  </span>
                  . The biggest opportunity is adding measurable impact to your
                  experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-800/80 bg-gray-900/30">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <p className="text-sm font-semibold text-blue-400">
              More than a resume score
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Know what works — and what to improve.
            </h2>

            <p className="mt-4 leading-7 text-gray-400">
              Get a structured analysis instead of generic AI feedback.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <FeatureCard
              number="01"
              title="ATS Readiness"
              description="See how well your resume is structured for applicant tracking systems and identify missing job-specific keywords."
            />

            <FeatureCard
              number="02"
              title="Detailed Scoring"
              description="Understand your experience, hard skills, education, achievements and overall resume quality separately."
            />

            <FeatureCard
              number="03"
              title="Actionable Advice"
              description="Receive prioritized recommendations based on your actual resume instead of vague or generic suggestions."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-800 bg-gray-900/70 px-8 py-14 text-center shadow-xl shadow-black/20">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to improve your next application?
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-400">
            Upload your resume, add the job description and get a detailed
            analysis in seconds.
          </p>

          <Link
            href="/signup"
            className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Get started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <AppLogo />

          <p>
            AI-powered resume analysis.
          </p>
        </div>
      </footer>
    </main>
  );
}


function PreviewScore({
  title,
  score,
}: {
  title: string;
  score: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-4xl font-bold">
          {score}
        </span>

        <span className="mb-1 text-sm text-gray-500">
          / 100
        </span>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{
            width: `${score}%`,
          }}
        />
      </div>
    </div>
  );
}


function ScoreRow({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {label}
        </span>

        <span className="font-medium text-gray-200">
          {score}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{
            width: `${score}%`,
          }}
        />
      </div>
    </div>
  );
}


function FeatureCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 transition hover:border-gray-700 hover:bg-gray-900">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-sm font-bold text-blue-400">
        {number}
      </div>

      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-gray-400">
        {description}
      </p>
    </article>
  );
}
