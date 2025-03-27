import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero", styles.heroBanner)}>
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
                Tutorial
              </Link>
              <Link className={styles.secondaryButton} to="/docs/intro">
                API Reference
              </Link>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <div className={styles.heroImage}>
              <div className={styles.browserMockup}>
                <div className={styles.browserHeader}>
                  <div className={styles.browserButtons}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className={styles.browserContent}>
                  {/* This would be your app screenshot */}
                  <img src="img/mockup.png" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function HomepageFeatureHighlights() {
  return (
    <section className={styles.featureHighlights}>
      <div className="container">
        <div className={styles.featureHighlightsHeader}>
          <h2>Why Jet Admin</h2>
          <p>
            The most powerful PostgreSQL admin panel for your operations team
          </p>
        </div>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <img src="img/table-index.png" height={100} />
            </div>
            <h3>Table Management</h3>
            <p>
              Easily view, filter, edit, and manage data in your PostgreSQL
              tables with a clean interface.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <img src="img/dashboard-index.png" height={100} />
            </div>
            <h3>Analytics Dashboards</h3>
            <p>
              Build custom dashboards with charts and metrics to visualize your
              business data in real-time.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <img src="img/sql-index.png" height={100} />
            </div>
            <h3>SQL Queries</h3>
            <p>
              Execute custom SQL queries directly from the interface and save
              them for future use.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <img src="img/role-index.png" height={100} />
            </div>
            <h3>Team Collaboration</h3>
            <p>
              Collaborate with your team using role-based permissions and
              activity tracking.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageDemonstration() {
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Define your screenshots here
  const screenshots = [
    {
      title: "Dashboard Builder",
      description:
        "Create custom dashboards with our intuitive drag-and-drop interface",
      image: "img/dashboards.png", // Replace with your actual path
    },
    {
      title: "Charts",
      description: "Connect to multiple PostgreSQL databases seamlessly",
      image: "img/charts.png", // Replace with your actual path
    },
    {
      title: "Data Editor",
      description:
        "Edit your database records with our user-friendly interface",
      image: "img/tables.png", // Replace with your actual path
    },
    {
      title: "SQL Query Tool",
      description: "Run and save complex SQL queries with ease",
      image: "img/query.png", // Replace with your actual path
    },
  ];

  const nextSlide = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === screenshots.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? screenshots.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  return (
    <section className={styles.demonstrationSection}>
      <div className="container">
        <div className={styles.demonstrationContent}>
          <div className={styles.demonstrationText}>
            <h2>Powerful PostgreSQL Management</h2>
            <p>
              Jet Admin provides a complete toolkit for working with your
              PostgreSQL databases. From data editing to visualization, we've
              got you covered.
            </p>
            <ul className={styles.demonstrationList}>
              <li>Create custom dashboards with drag-and-drop</li>
              <li>Connect to multiple PostgreSQL databases</li>
              <li>Edit data with an intuitive interface</li>
              <li>Run and save SQL queries</li>
            </ul>
            <div className={styles.demonstrationCta}>
              <Link to="/docs/intro" className={styles.learnMoreButton}>
                Explore Features
              </Link>
            </div>
          </div>
          <div className={styles.demonstrationImage}>
            <div className={styles.screenshotShowcase}>
              <div className={styles.screenshotBrowserFrame}>
                <div className={styles.browserHeader}>
                  <div className={styles.browserButtons}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className={styles.screenshotContainer}>
                  <div
                    className={styles.screenshotSlider}
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                  >
                    {screenshots.map((screenshot, index) => (
                      <div key={index} className={styles.screenshotSlide}>
                        <img
                          src={screenshot.image}
                          alt={screenshot.title}
                          className={styles.screenshotImage}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    className={`${styles.screenshotNavButton} ${styles.screenshotNavButtonPrev}`}
                    onClick={prevSlide}
                    aria-label="Previous screenshot"
                  >
                    ←
                  </button>
                  <button
                    className={`${styles.screenshotNavButton} ${styles.screenshotNavButtonNext}`}
                    onClick={nextSlide}
                    aria-label="Next screenshot"
                  >
                    →
                  </button>
                </div>
              </div>
              <div className={styles.screenshotInfo}>
                <h3>{screenshots[activeIndex].title}</h3>
                <p>{screenshots[activeIndex].description}</p>
              </div>
              <div className={styles.screenshotDots}>
                {screenshots.map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.screenshotDot} ${
                      index === activeIndex ? styles.screenshotDotActive : ""
                    }`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to screenshot ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageTestimonials() {
  return (
    <section className={styles.testimonialsSection}>
      <div className="container">
        <h2 className={styles.testimonialsHeader}>Trusted by Data Teams</h2>
        <div className={styles.testimonialCards}>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialContent}>
              <p>
                "Jet Admin has transformed how our operations team interacts
                with our PostgreSQL databases. The interface is intuitive and
                powerful."
              </p>
            </div>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAvatar}></div>
              <div className={styles.testimonialInfo}>
                <h4>Sarah Johnson</h4>
                <p>Data Operations, TechCorp</p>
              </div>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialContent}>
              <p>
                "We've reduced the time spent on database management by 60%
                since implementing Jet Admin. Our team loves the dashboard
                capabilities."
              </p>
            </div>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAvatar}></div>
              <div className={styles.testimonialInfo}>
                <h4>Michael Chen</h4>
                <p>CTO, DataFlow Inc</p>
              </div>
            </div>
          </div>
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
          <h2>Ready to get started with Jet Admin?</h2>
          <p>
            Join thousands of teams managing their PostgreSQL databases with
            ease.
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/docs/intro" className={styles.getStartedButton}>
              Get Started
            </Link>
            <Link to="/docs/intro" className={styles.ghostButton}>
              View Demo
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
      description="Welcome to Jet Admin, a web-based PostgreSQL tables manager and admin dashboard for your operations! Edit data, build graphs, and create dashboards using queries."
    >
      <HomepageHeader />
      <HomepageFeatureHighlights />
      <HomepageDemonstration />

      <HomepageCTA />
    </Layout>
  );
}
