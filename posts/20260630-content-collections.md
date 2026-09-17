---
title: "コンテンツコレクションで記事ページを作る"
createdAt: "2026-06-30 12:00"
updatedAt: "2026-06-30 12:00"
tags:
  - "astro"
  - "content-collections"
  - "typescript"
  - "temporal"
  - "frontend"
---

## はじめに

[前回](../20260629-astro-basics/)まででAstroプロジェクトのセットアップ、GitHub Pagesへのデプロイまで終わりました。今回はいよいよ記事ページを作っていきます。

Astroには**コンテンツコレクション**という仕組みがあって、ブログ記事のようなコンテンツを型安全に管理・取得できます。

## [コンテンツコレクション](https://docs.astro.build/ja/guides/content-collections/)とは

さっくり言えば「構造が同じコンテンツ群を、型安全に、効率よく管理・取得するための仕組み」です。

Zodでスキーマを定義すると、各エントリーのフロントマターがバリデーションされ、TypeScriptの型が自動生成されます。必須フィールドが抜けていたらビルド時にエラーになるので、記事データの不整合を事前に検知できます。

コレクションには2種類あります。

- **Build-time content collection**: ビルド時にデータを取得・保存する。ブログや静的なドキュメントに向いている
- **Live content collection**: リクエストのたびにデータを取得する。在庫情報や価格など頻繁に更新されるコンテンツに向いている

このブログでは前者を使います。

## 1. ディレクトリを作成する

`src/pages/`以外ならどこにでも配置できるのが便利なところです。`src/`の外でも構いません。今回はプロジェクトルートに`/posts`ディレクトリを作成して、記事のMarkdownファイルをそこに置くことにしました。

## 2. スキーマを定義する

`src/content.config.ts`を作成してコレクションとスキーマを定義します。

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const jstTimestamp = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/)
  .transform((str) =>
    Temporal.PlainDateTime.from(str.replace(" ", "T"))
      .toZonedDateTime("Asia/Tokyo")
      .toString()
  );

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./posts" }),
  schema: z.object({
    title: z.string(),
    createdAt: jstTimestamp,
    updatedAt: jstTimestamp,
    tags: z.array(z.string()),
  }),
});

export const collections = { posts };
```

### [Temporal](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Temporal)を使いたかった話

`createdAt`と`updatedAt`は日付・時刻なので、`Date`よりTemporalの方が適切だと思って試してみました。[Node.js v26からデフォルトで使えるようになった](https://nodejs.org/ja/blog/release/v26.0.0#temporal-api#temporal-api)やつです。

`Date`には設計上の問題が色々あって、「誕生日のような日付」「特定の瞬間を示すタイムスタンプ」「タイムゾーン付きの日時」といった、性質が全然違うものを一つの型で表現しようとしていた、というのが主な問題です。Temporalはこれを用途別のクラスに分けています。

今回使おうとしたのは`Temporal.ZonedDateTime`（タイムゾーン付きの日時）です。フロントマターに`"2026-06-29 14:30"`のように書いておいて、JST（Asia/Tokyo）のZonedDateTimeに変換する、という設計で試してみました。

**が、動きませんでした。**

```
DataCloneError: [object Temporal.ZonedDateTime] could not be cloned.
```

Astroが`getCollection()`の内部で`structuredClone`を使っていて、`Temporal`オブジェクトはstructured clone非対応なのが原因です。`Date`はstructured clone対応なのですが、Temporalはまだそうなっていません。

断念して、ZonedDateTimeの`.toString()`で得られるISO文字列（`"2026-06-29T14:30:00+09:00[Asia/Tokyo]"`）として保持することにしました。表示するときは`Temporal.ZonedDateTime.from(entry.data.createdAt)`で戻せます。

### `astro:content`がtsエラーになるとき

`content.config.ts`を作成・更新した直後は、`"astro:content"`のインポートでTypeScriptエラーが出ることがあります。`astro:content`モジュールの型定義はAstroが自動生成するもので、開発サーバーの再起動またはコンテンツレイヤーの同期（開発サーバー起動中に`s + Enter`）で生成されます。エラーが出たらこれで解消します。

## 3. 記事ページを作る

コレクションのディレクトリは`src/pages/`に置けないので、そのままではルーティングされません。`src/pages/posts/[...slug].astro`を作成して記事ページを生成します。

```astro
---
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map(post => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---

<Content />
```

`getStaticPaths`はAstroがビルド時に自動で呼び出す関数で、「どんなURLのページを作るか」を返します。`export`しているのはAstroに向けて公開するためです。

`getStaticPaths`で返した`props`は、同じファイルのフロントマター内で`Astro.props`として受け取れます。Next.jsの`getStaticPaths` + `getStaticProps`に近い概念ですが、Astroでは一つのファイルにまとめて書ける設計になっています。

### `[slug]`と`[...slug]`の違い

`[...slug].astro`（スプレッド構文）にしたのは、URLにスラッシュを含めたいケースに対応するためです。

```ts
// [slug].astroの場合
// /posts/my-first-post → "my-first-post"
Astro.params.slug

// [...slug].astroの場合
// /posts/my-first-post → "my-first-post"
// /posts/2024/01/my-first-post → "2024/01/my-first-post"（スラッシュごと入ってくる）
Astro.params.slug
```

今のところスラッシュを含むURLにする予定はないですが、将来的な拡張を考えて`[...slug]`にしました。

## まとめ

コンテンツコレクションを使うことで、型安全にMarkdownを管理できるようになりました。Zodのスキーマ定義のおかげで、フロントマターの不備をビルド時に検知できるのが地味に便利です。

Temporalは使えませんでしたが、文字列として保持しておいて表示時に変換するというワークアラウンドで、一応Temporalの恩恵は受けられます。そのうちTemporalオブジェクトがstructuredCloneに対応されると嬉しいですね。

次回はレイアウトコンポーネントを作ります。現状だと`<head>`がないために文字化けするので……。
