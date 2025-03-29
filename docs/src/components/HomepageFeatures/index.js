import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Database tables',
    src: require('@site/static/img/tables.png').default,
    description: (
      <>
        Create, Update, Delete and View database table rows
      </>
    ),
  },
  {
    title: 'Query as objects',
    src: require('@site/static/img/query.png').default,
    description: (
      <>
        Save postgres queries as objects which when used will be executed in run-time. Output can be checked by testing the query
      </>
    ),
  },
  {
    title: 'Graphs and Dashbaords',
    src: require('@site/static/img/dashboards.png').default,
    description: (
      <>
        Saved queries are be used as data source for support graphs by defining label, values, x-axis, y-axis etc.
      </>
    ),
  },
];

function Feature({src, title, description}) {
  return (
    <div className={clsx("col col--12 ")}>
      <div
        className={clsx([
          "padding-horiz--md text--center",
          styles.featureTextContainer,
        ])}
      >
        <Heading as="h3" className={styles.featureText}>
          {title}
        </Heading>
        <p className={styles.featureText}>{description}</p>
      </div>
      <div className="text--center">
        <img src={src} className={styles.featureSvg} role="img" />
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
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
