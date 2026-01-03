import React, { useState, useEffect } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import styles from "./index.module.css";
// Icons can be imported from react-icons if available, or use SVGs/Images.
// For now we stick to simple elements or img tags to minimize dependency issues if react-icons isn't installed.

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroBackground}>
        <div className={styles.heroBackgroundCircle1}></div>
        <div className={styles.heroBackgroundCircle2}></div>
        <div className={styles.heroBackgroundPattern}></div>
      </div>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroTextContent}>
            <Heading as="h1" className={styles.title}>
              {siteConfig.title}
            </Heading>
            <p className={styles.subtitle}>{siteConfig.tagline}</p>
            <div className={styles.buttonContainer}>
              <Link className={styles.getStartedButton} to="/docs/intro">
                Get Started
              </Link>
              <Link className={styles.secondaryButton} to="https://github.com/Jet-labs/Jet-admin">
                GitHub
              </Link>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <div className={styles.browserMockup}>
              <div className={styles.browserHeader}>
                <div className={styles.browserButtons}>
                  <span style={{ background: '#ff5f56' }}></span>
                  <span style={{ background: '#ffbd2e' }}></span>
                  <span style={{ background: '#27c93f' }}></span>
                </div>
              </div>
              <div className={styles.browserContent}>
                <img src="img/mockup.png" alt="Jet Admin Dashboard" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function FeatureCard({ title, description, icon, delay }) {
  return (
    <div className={styles.featureCard} style={{ transitionDelay: `${delay}ms` }}>
      <div className={styles.featureIcon}>
        {/* Simple placeholder icon if no image provided */}
        {icon ? <img src={icon} alt={title} width="24" height="24" /> : <span>★</span>}
      </div>
      <Heading as="h3">{title}</Heading>
      <p>{description}</p>
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
    <section className={styles.featureHighlights}>
      <div className="container">
        <div className={styles.featureHighlightsHeader}>
          <h2>Why Jet Admin?</h2>
          <p>The most powerful PostgreSQL admin panel for your operations team, built for speed and flexibility.</p>
        </div>
        <div className={styles.featureGrid}>
          {features.map((props, idx) => (
            <FeatureCard key={idx} {...props} delay={idx * 100} />
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

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.demonstrationSection}>
      <div className="container">
        <div className={styles.screenshotShowcase}>
          <div className={styles.screenshotBrowserFrame}>
            <div className={styles.browserHeader}>
              <div className={styles.browserButtons}>
                <span style={{ background: '#ff5f56' }}></span>
                <span style={{ background: '#ffbd2e' }}></span>
                <span style={{ background: '#27c93f' }}></span>
              </div>
            </div>
            <div className={styles.screenshotSlider} style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
              {screenshots.map((s, idx) => (
                <div className={styles.screenshotSlide} key={idx}>
                  <img src={s.image} alt={s.title} style={{ width: '100%', display: 'block' }} />
                </div>
              ))}
            </div>
            <button className={`${styles.screenshotNavButton} ${styles.screenshotNavButtonPrev}`} onClick={prevSlide}>←</button>
            <button className={`${styles.screenshotNavButton} ${styles.screenshotNavButtonNext}`} onClick={nextSlide}>→</button>
          </div>
          <div className={styles.screenshotInfo}>
            <Heading as="h3">{screenshots[activeIndex].title}</Heading>
            <p>{screenshots[activeIndex].description}</p>
            <div className={styles.screenshotDots}>
              {screenshots.map((_, idx) => (
                <button
                  key={idx}
                  className={`${styles.screenshotDot} ${idx === activeIndex ? styles.screenshotDotActive : ''}`}
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
    <section className={styles.testimonialsSection}>
      <div className="container">
        <h2 className={styles.testimonialsHeader}>Trusted by Data Teams</h2>
        <div className={styles.testimonialCards}>
          {testimonials.map((t, i) => (
            <div key={i} className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>"{t.quote}"</div>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatar}></div>
                <div className={styles.testimonialInfo}>
                  <h4>{t.author}</h4>
                  <p>{t.role}</p>
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
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.ctaContent}>
          <h2>Ready to Supercharge Your Workflow?</h2>
          <p>Join thousands of developers and teams managing their PostgreSQL databases with Jet Admin.</p>
          <div className={styles.ctaButtons}>
            <Link to="/docs/intro" className={styles.getStartedButton}>
              Get Started Now
            </Link>
            <Link to="https://github.com/Jet-labs/Jet-admin" className={styles.ghostButton}>
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

