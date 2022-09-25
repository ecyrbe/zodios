import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";
import { IoBrowsersOutline, IoServer } from "react-icons/io5";
import { TbApi } from "react-icons/tb";

type FeatureItem = {
  title: string;
  Icon: JSX.Element;
  descriptions: string[];
};

const FeatureList: FeatureItem[] = [
  {
    title: "Client",
    Icon: <IoBrowsersOutline size={50} />,
    descriptions: [
      "autocompletion even in pure javascript",
      "typed parameters and response",
      "parameters and response validation",
      "powerfull plugin system",
      "react and solid hooks based on tanstack-query",
    ],
  },
  {
    title: "API definition",
    Icon: <TbApi size={50} />,
    descriptions: [
      "shared api definition",
      "schema declaration with zod",
      "openapi generator and swagger ui",
    ],
  },
  {
    title: "Server",
    Icon: <IoServer size={50} />,
    descriptions: [
      "autocompletion even in pure javascript",
      "network inputs validation",
      "100% compatibility with express",
      "easy integration with NextJS",
    ],
  },
];

function Feature({ title, Icon, descriptions }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className={clsx(styles.featureIconCenter)}>
        <div className={clsx(styles.featureIcon)}>{Icon}</div>
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <ul className={clsx(styles.featureDescriptions)}>
          {descriptions.map((description) => (
            <li>{description}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
