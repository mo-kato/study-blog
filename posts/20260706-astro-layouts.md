---
title: "レイアウトコンポーネントを作る"
createdAt: "2026-07-06 13:00"
updatedAt: "2026-07-06 13:00"
tags:
  - "astro"
  - "typescript"
  - "frontend"
---

## はじめに

[前回](../20260630-content-collections/)はコンテンツコレクションを使って記事ページを作りました。ただ、あの状態だと`<head>`がなく、文字コードの指定もされていないので日本語が文字化けしてしまいます。今回はこれを解消するために、レイアウトコンポーネントを作っていきます。

## Astroのレイアウトはただのコンポーネント

「レイアウト」という名前がついているし、公式にもレイアウト専用のチュートリアルページがあるので、何か特別な仕組みがあるのかと思っていましたが、調べてみるとAstroのレイアウトは普通のAstroコンポーネントでした。

Next.jsのレイアウトのように自動的に適用される仕組みではないので、`src/pages/`のページファイルや他のレイアウトファイルから明示的にimportして呼び出す必要があります。Reactでいう`{children}`に当たるのが、Astroでは`<slot />`です。

## ルートレイアウトを作る

まず、`<html>`や`<head>`などhtml文書の一番外側を構成するレイアウトを作りました。`src/layouts/RootLayout.astro`です。

```astro
---
const { pageTitle } = Astro.props;
---

<html lang="ja">
  <head>
    <meta charset="utf-8">
    <link
      rel="icon"
      type="image/svg+xml"
      href={`${import.meta.env.BASE_URL}favicon.ico`}
    >
    <link rel="icon" href={`${import.meta.env.BASE_URL}favicon.svg`}>
    <meta name="viewport" content="width=device-width">
    <meta name="generator" content={Astro.generator}>
    <title>{pageTitle}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

`pageTitle`をpropsで受け取って`<title>`に埋め込み、本文は`<slot />`の位置に差し込まれる、というシンプルな構成です。

faviconのhrefに出てくる`${import.meta.env.BASE_URL}`は、`astro.config.mjs`の`base`オプションの値が入る環境変数です。Astro公式の「[AstroサイトをGitHub Pagesにデプロイする](https://docs.astro.build/ja/guides/deploy/github/)」にある通り、GitHub Pagesはリポジトリ名がそのままサブパスになるため、`/favicon.ico`のように絶対パスで固定してしまうとリンク切れになります。`BASE_URL`を先頭に付けておくことで、`base`の値を変えてもリンク切れになりません。

## Propsの受け取り方

Astroコンポーネントでは、フロントマターで分割代入した変数がそのままpropsになります。

```ts
const { hoge, fuga } = Astro.props;
```

型については、公式ドキュメントに以下のような説明がありました。

> Astroはフロントマター内のPropsインターフェイスを自動的に検出し、型の警告やエラーを出します。

インターフェイスを定義しておくだけで型チェックが効くのは便利だと感じました。「インターフェイス」と書かれていますが、試してみたところ`type`でも問題なく動きました。

## PostLayoutを作る

記事ページ用のレイアウトとして、`src/layouts/PostLayout.astro`を作りました。

```astro
---
import type { CollectionEntry } from "astro:content";
import RootLayout from "@layouts/RootLayout.astro";

interface Props {
  frontmatter: CollectionEntry<"posts">["data"];
}
const { frontmatter } = Astro.props;
---

<RootLayout pageTitle={frontmatter.title}>
  <slot />
</RootLayout>
```

`frontmatter`の型には、[前回](../20260630-content-collections/)定義したコンテンツコレクションのスキーマから`CollectionEntry<"posts">["data"]`で型を持ってきています。AIに相談すると`InferEntrySchema<"posts">`を使えばいいと提案されますが、`InferEntrySchema`は公式ドキュメントに載っていませんし、`content.d.ts`を見ても`export`がついていない型でした。使うのは少し気持ち悪かったので、公式ドキュメントに載っている`CollectionEntry`の方を採用しています。

このPostLayoutは、RootLayoutを内部でimportして`pageTitle`を渡しつつ、自分自身の`<slot />`で受け取った本文をRootLayoutの`<slot />`にそのまま流し込む、という構成です。呼び出す側の`src/pages/posts/[...slug].astro`ではこう使います。

```astro
<PostLayout frontmatter={post.data}>
  <Content />
</PostLayout>
```

これで記事ページに`<head>`がついて、文字化けも直りました。

## slotについて

基本のslotは、コンポーネント側で`<slot />`と書いておくだけで、呼び出し側の子要素がそこに挿入される仕組みです。RootLayoutで使っているのがこの形です。

Astroには名前付きslotもあり、一つのslotに複数の要素をまとめて渡したいときは`<Fragment>`が使えます。`<Fragment>`は実際のDOMとしてはレンダリングされません。Reactにも似たような`<>`（Fragment）がありますが、名前付きslotに相当する機能はReactにはないので、この点はAstroの方がすっきり書けると感じました。同じことをしようとすると、Reactではpropsとして要素を渡すことになります。

```ts
// React
function Sample({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div>
      {left}
      {right}
    </div>
  );
}

function SampleWrapper({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <Sample
      left={<><p>left</p><p>content</p></>}
      right={<p>right content</p>}
    />
  );
}
```

```astro
---
// Sample.astro
---
<div>
  <slot name="left">
  <slot name="right">
</div>
```

```astro
---
// SampleWrapper.astro
import Sample from './Sample.astro';
---
<Sample>
  <Fragment slot="left">
    <p>left</p>
    <p>content</p>
  </Fragment>
  <p slot="right">right content</p>
</Sample>
```

## Markdownのフロントマターにレイアウトを指定する方法もある

今回は使いませんでしたが、`src/pages/`直下にMarkdownファイルを直接置く場合は、フロントマターに`layout`を指定するだけでも良いようです。

```md
---
layout: ../layouts/PostLayout.astro
title: "記事タイトル"
---
```

こうすると、レイアウトの無名slotにMarkdown本文が挿入されます。このブログでは記事をコンテンツコレクション側（`/posts/`）で管理していて、ページ生成は`[...slug].astro`が担当しているので、この書き方は使っていませんが、Markdownファイルを`src/pages/`に直接置くタイプの構成なら選択肢になりそうです。素敵な仕組みですね。

## まとめ

レイアウトは特別な仕組みではなく、`<slot />`を使った普通のAstroコンポーネントだと分かりました。RootLayoutで文書の外枠を、PostLayoutで記事固有の部分を担当する形に分けたことで、記事ページに`<head>`が入り、文字化けも解消しました。

Propsの型チェックが自動で効くのも地味に助かるポイントでした。次に触るときは、実際に記事の一覧ページや詳細ページの見た目も整えていきたいです。
