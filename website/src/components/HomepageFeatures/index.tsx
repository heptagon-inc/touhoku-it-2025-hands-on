import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '🚀 実践的なサーバーレス構築',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        S3、Lambda、DynamoDB、CloudFrontを組み合わせた
        <strong>本格的な画像処理システム</strong>を2時間で構築。
        実際に本番環境で使える技術を習得できます。
      </>
    ),
  },
  {
    title: '🎯 初心者から上級者まで対応',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        基本的なAWS操作から、WebP変換などの<strong>最新技術</strong>まで段階的に学習。
        東北の地域コミュニティで共に成長する学習体験を提供します。
      </>
    ),
  },
  {
    title: '🏔️ 東北IT物産展2025',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        地域の技術者同士が集まる<strong>東北IT物産展</strong>で開催。
        ハンズオン後は参加者同士で交流し、東北のIT技術コミュニティを育てていきましょう。
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
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
