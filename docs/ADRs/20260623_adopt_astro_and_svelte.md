# 個人ブログの SSG・UI フレームワーク・スタイリングを選定する

* Status: accepted
* Date: 2026-06-23

## コンテキストと問題提起

静的ホスティングで運用することは [20260623_adopt_static_hosting.md](20260623_adopt_static_hosting.md) で決定済み。本 ADR はその前提のもと、SSG・UI フレームワーク・スタイリングの技術スタックを選定する。

コンテンツ配信を主目的とした静的サイトであり、想定するインタラクティブ機能は限定的（ダークモード・目次・検索・コードコピー）。クライアントサイド JavaScript を最小化しながら技術学習の場としても活用したい。

**この決定が答える問い：** クライアントサイド JavaScript を最小化しつつ限定的なインタラクティブ機能を実現できる技術スタックはどれか？

## 検討した選択肢

* Astro + Svelte + Panda CSS
* Astro + React + Tailwind CSS
* Next.js

## 決定の結果

選択肢：**Astro + Svelte + Panda CSS**、なぜなら Astro はデフォルトで全ページをゼロJS出力し、Islands としてマークしたコンポーネントのみをハイドレーションする設計であり、「静的ページを基本としつつ必要箇所のみインタラクティブにする」という本プロジェクトの方針と設計思想が一致するからである。また、Svelte のコンパイル時最適化と Panda CSS のビルド時 CSS 生成により、クライアントサイドの実行コストを最小化できる。Astro + React + Tailwind CSS は同じ Astro ベースだが既存知識の延長になるため学習目的を果たせない。Next.js は静的エクスポートも可能だがコンテンツ主体のサイトには機能過多。

### 結果・影響

* Good: Islands Architecture により、静的ページとして出力しながら必要箇所だけインタラクティブにできる
* Good: Markdown + Content Collections による Git ベースのコンテンツ管理
* Good: Svelte のコンパイル時最適化と Panda CSS のビルド時 CSS 生成によりランタイムコストがほぼゼロ
* Good: Panda CSS により TypeScript でデザイントークンを管理でき、型安全なスタイリングを実現できる
* Good: Svelte という未経験スタックを実プロジェクトで習得できる
* Bad: Svelte は未経験のため初期開発速度が低下する可能性がある
* Bad: Panda CSS は比較的マイナーフレームワークであり、長期的なメンテナンス継続が不透明である
* Bad: React + Tailwind と比べてコミュニティ規模が小さく、サンプルコードや Q&A が少ない

## 追加情報

* WordPress は Git によるコンテンツ管理および DB 不要という要件の時点で除外した
* Gatsby は React + GraphQL を前提とするアーキテクチャが小規模サイトに対して複雑すぎるため除外した
* スタイリングは Tailwind CSS・CSS Modules・SCSS も検討したが、TypeScript によるデザイントークン管理と型安全性を優先して Panda CSS を選択した
* UI フレームワークは Astro + Vue も検討したが、既存知識の延長ではなく新規学習を優先した
* インタラクティブ機能の要件が大きく変わった場合、または Panda CSS の学習コストが許容範囲を超えた場合は本 ADR を再検討する
