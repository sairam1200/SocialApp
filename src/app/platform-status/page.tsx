
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import LandingPrimaryNav from "@/components/landing-page/LandingPrimaryNav";
import LandingFooter from "@/components/landing-page/LandingFooter";
import features, { getCategories, getFeaturesByCategory, getStats } from "@/lib/platform-features";

export const metadata: Metadata = {
  title: "Platform Features | Gaddr",
  description: "Track the current development progress of Gaddr and explore implemented and upcoming features.",
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; dot: string }> = {
  completed: { label: "Completed", variant: "default", dot: "bg-green-500" },
  partial: { label: "Partial", variant: "secondary", dot: "bg-amber-500" },
  planned: { label: "Planned", variant: "outline", dot: "bg-blue-500" },
  not_started: { label: "Not Started", variant: "destructive", dot: "bg-gray-400" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.not_started;
  return (
    <Badge variant={cfg.variant} className="gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </Badge>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 text-center space-y-1 hover:shadow-sm transition-shadow">
      <p className={`text-3xl md:text-4xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-semibold text-foreground">Overall Completion</span>
        <span className="text-2xl font-bold gradient-text-primary">{pct}%</span>
      </div>
      <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#6400BF] to-[#0F13B9] transition-all duration-1000 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function FeatureCard({ feature }: { feature: (typeof features)[number] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-sm leading-snug">{feature.title}</h3>
        <StatusBadge status={feature.status} />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
      {feature.notes && (
        <p className="text-xs text-muted-foreground/70 italic border-t border-border pt-2">{feature.notes}</p>
      )}
    </div>
  );
}

function CategorySection({ category }: { category: string }) {
  const items = getFeaturesByCategory(category);
  if (items.length === 0) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">{category}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((f) => (
          <FeatureCard key={f.id} feature={f} />
        ))}
      </div>
    </section>
  );
}

export default function PlatformStatusPage() {
  const stats = getStats();
  const categories = getCategories();

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero */}
      <header className="relative w-full bg-[linear-gradient(117deg,#0D0932_28.21%,#501F98_75.34%)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[url('/images/landing-bg-pattern.webp')] bg-repeat bg-top opacity-[0.05]" />
        <div className="relative max-w-7xl mx-auto px-5 pt-6 md:pt-7">
          <LandingPrimaryNav />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Platform Features
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Track the current development progress of Gaddr and explore
            implemented and upcoming features.
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="flex-1 bg-background">
        <div className="max-w-6xl mx-auto px-5 py-12 md:py-16 space-y-12">
          {/* Progress Bar */}
          <div className="rounded-xl border border-border bg-card p-6 md:p-8">
            <ProgressBar pct={stats.completionPct} />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Completed Features" value={stats.completed} color="text-green-600" />
            <StatCard label="Partial Features" value={stats.partial} color="text-amber-600" />
            <StatCard label="Planned Features" value={stats.planned} color="text-blue-600" />
            <StatCard label="Not Started" value={stats.notStarted} color="text-gray-500" />
            <StatCard label="Total Features" value={stats.total} color="text-foreground" />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Legend:</span>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <span key={key} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            ))}
          </div>

          {/* Feature Categories */}
          <div className="space-y-10">
            {categories.map((cat) => (
              <CategorySection key={cat} category={cat} />
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
