import React, { useState, useEffect } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className="relative py-16 md:py-24 bg-background overflow-hidden border-b border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 space-y-4 text-left">
            <Heading as="h1" className="text-4xl md:text-6xl font-medium tracking-tight text-foreground leading-tight">
              {siteConfig.title}
            </Heading>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              {siteConfig.tagline}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Link className="h-10 px-5 bg-primary text-primary-foreground font-medium rounded-sm hover:bg-primary/90 transition-all inline-flex items-center justify-center text-sm" to="/docs/introduction">
                Get Started
              </Link>
              <Link className="h-10 px-5 bg-background border border-border text-foreground font-medium rounded-sm hover:bg-muted/50 transition-all inline-flex items-center justify-center text-sm" to="https://github.com/Jet-labs/Jet-admin">
                GitHub
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="rounded-sm border border-border bg-card shadow-md overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 border-b border-border">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <div className="bg-background p-2">
                <img src="img/mockup.png" alt="Jet Admin Dashboard" className="w-full h-auto block rounded-sm border border-border shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function FeatureCard({ title, description, icon }) {
  return (
    <div className="rounded-sm border border-border bg-card p-2 flex flex-col gap-2 transition-all hover:border-border/80">
      <div className="bg-muted/30 p-2 rounded-sm border border-border w-10 h-10 flex items-center justify-center">
        {icon ? <img src={icon} alt={title} className="w-5 h-5 object-contain" /> : <span className="text-primary text-sm">★</span>}
      </div>
      <Heading as="h3" className="text-lg font-medium text-foreground">
        {title}
      </Heading>
      <p className="text-[13px] text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function HomepageFeatureHighlights() {
  const features = [
    {
      title: "Table Management",
      description: "Easily view, filter, edit, and manage data in your PostgreSQL tables with a clean, spreadsheet-like interface.",
      icon: "img/table-index.png",
    },
    {
      title: "Analytics Dashboards",
      description: "Build custom dashboards with charts and metrics to visualize your business data in real-time.",
      icon: "img/dashboard-index.png",
    },
    {
      title: "SQL Queries",
      description: "Execute custom SQL queries directly from the interface, save them, and visualize the results.",
      icon: "img/sql-index.png",
    },
    {
      title: "Team Collaboration",
      description: "Collaborate with your team using role-based permissions, activity tracking, and shared workspaces.",
      icon: "img/role-index.png",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/50 border-b border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-medium tracking-tight text-foreground">Why Jet Admin?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The most powerful PostgreSQL admin panel for your operations team, built for speed and flexibility.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {features.map((props, idx) => (
            <FeatureCard key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ScreenshotShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  const screenshots = [
    {
      title: "Dashboard Builder",
      description: "Create custom dashboards with our intuitive drag-and-drop interface.",
      image: "img/dashboards.png",
    },
    {
      title: "Data Visualization",
      description: "Connect to multiple databases and visualize complex relationships.",
      image: "img/charts.png",
    },
    {
      title: "Data Editor",
      description: "Edit your database records with a powerful, user-friendly interface.",
      image: "img/tables.png",
    },
    {
      title: "SQL Workspace",
      description: "Run and run complex SQL queries with ease via the built-in IDE.",
      image: "img/query.png",
    },
  ];

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  };
  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  };
  const goToSlide = (index) => setActiveIndex(index);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 w-full relative">
            <div className="rounded-sm border border-border bg-card shadow-md overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-6 h-6 flex items-center justify-center bg-background border border-border text-foreground hover:bg-muted/50 rounded-sm transition-colors text-xs cursor-pointer" onClick={prevSlide}>
                    &larr;
                  </button>
                  <button className="w-6 h-6 flex items-center justify-center bg-background border border-border text-foreground hover:bg-muted/50 rounded-sm transition-colors text-xs cursor-pointer" onClick={nextSlide}>
                    &rarr;
                  </button>
                </div>
              </div>
              <div className="relative overflow-hidden w-full h-[300px] md:h-[400px] bg-background">
                {screenshots.map((s, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-500 p-2 ${idx === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                  >
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover rounded-sm border border-border/50" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-4 text-left">
            <Heading as="h3" className="text-3xl font-medium tracking-tight text-foreground">
              {screenshots[activeIndex].title}
            </Heading>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {screenshots[activeIndex].description}
            </p>
            <div className="flex items-center gap-1.5 pt-2">
              {screenshots.map((_, idx) => (
                <button
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === activeIndex ? "w-6 bg-primary" : "w-2 bg-muted/50 hover:bg-muted"}`}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageTestimonials() {
  const testimonials = [
    {
      quote: "Jet Admin has transformed how our operations team interacts with our PostgreSQL databases. The interface is intuitive and powerful.",
      author: "Sarah Johnson",
      role: "Data Operations, TechCorp"
    },
    {
      quote: "We've reduced the time spent on database management by 60% since implementing Jet Admin. Our team loves the dashboard capabilities.",
      author: "Michael Chen",
      role: "CTO, DataFlow Inc"
    },
    {
      quote: "The best open-source admin panel we've tried. It's incredibly fast and easy to extend.",
      author: "Alex Rivera",
      role: "Lead Dev, StartupX"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/50 border-b border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-medium tracking-tight text-foreground">Trusted by Data Teams</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {testimonials.map((t, i) => (
            <div key={i} className="rounded-sm border border-border bg-card p-2 flex flex-col justify-between gap-4">
              <div className="text-[13px] text-foreground/90 leading-relaxed italic">
                "{t.quote}"
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-primary">
                  {t.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground leading-none">{t.author}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-none">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomepageCTA() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="rounded-sm border border-border bg-card p-4 space-y-4 shadow-sm">
          <h2 className="text-3xl font-medium tracking-tight text-foreground">Ready to Supercharge Your Workflow?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Join thousands of developers and teams managing their PostgreSQL databases with Jet Admin.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link to="/docs/introduction" className="h-10 px-5 bg-primary text-primary-foreground font-medium rounded-sm hover:bg-primary/90 transition-all inline-flex items-center justify-center text-sm">
              Get Started Now
            </Link>
            <Link to="https://github.com/Jet-labs/Jet-admin" className="h-10 px-5 bg-background border border-border text-foreground font-medium rounded-sm hover:bg-muted/50 transition-all inline-flex items-center justify-center text-sm">
              View on GitHub
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="The ultimate open-source PostgreSQL admin panel and dashboard builder.">
      <HomepageHeader />
      <HomepageFeatureHighlights />
      <ScreenshotShowcase />
      <HomepageTestimonials />
      <HomepageCTA />
    </Layout>
  );
}
