import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <video width="100%" autoPlay muted controls>
          <source src="/video/zodios.mp4" type="video/mp4" />
        </video>
        <p>
          <ul style={{ listStyleType: "none" }}>
            <li>
              Shared API definitions based on{" "}
              <a
                href="https://zod.dev/"
                style={{ color: "white", textDecoration: "underline" }}
              >
                Zod
              </a>
            </li>
            <li>
              Standalone typesafe API client based on{" "}
              <a
                href="https://tanstack.com/query"
                style={{ color: "white", textDecoration: "underline" }}
              >
                TanStack Query
              </a>{" "}
              with parameters and response validation
            </li>
            <li>
              Typesafe server based on{" "}
              <a
                href="https://expressjs.com/"
                style={{ color: "white", textDecoration: "underline" }}
              >
                Express
              </a>{" "}
              with input validation
            </li>
          </ul>
        </p>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
