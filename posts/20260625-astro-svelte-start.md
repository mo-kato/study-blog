---
title: "Astro + Svelteで個人ブログを作り始めた"
createdAt: "2026-06-25 20:00"
updatedAt: "2026-06-25 20:00"
tags:
  - "astro"
  - "svelte"
  - "frontend"
---

## はじめに

個人ブログを作ることにしました。技術的なことをアウトプットする場が欲しいというのが動機です。

どうせ作るなら学習も兼ねたい。ということで、フレームワークの選定から自分でやることにしました。選んだのはAstro + Svelteの組み合わせです（なぜこの組み合わせを選んだかは、別の記事で書く予定です）。

この記事では、プロジェクトを作成してSvelteコンポーネントを動かすところまでを記録します。

### この記事に登場するライブラリのバージョン

```json
  "dependencies": {
    "@astrojs/svelte": "^9.0.0",
    "astro": "^7.0.0",
    "svelte": "^5.56.3",
    "typescript": "^6.0.3"
  },
```

## AstroとSvelteについて

### Astro

> Astroは、ブログやマーケティング、eコマースなど、コンテンツ駆動のウェブサイトを作成するためのウェブフレームワークです。[^1]

[^1]: https://docs.astro.build/ja/concepts/why-astro/

TwitterやFigmaのような「ウェブアプリケーション」ではなく、静的なコンテンツが中心のサイトを作るために設計されています。大きな特徴は、デフォルトでクライアントサイドJavaScriptを出力しないことです。

> デフォルトでは、AstroはすべてのUIコンポーネントをHTMLとCSSのみへレンダリングし、クライアントサイドJavaScriptを自動的に取り除きます。[^2]

[^2]: https://docs.astro.build/ja/concepts/islands/#クライアントアイランド

JavaScriptが不要なページのビルド結果はHTMLとCSSだけになります。ブログのような「ただ読みたいだけ」のサイトには理にかなっている設計です。

動的な要素が必要な部分だけにJavaScriptを適用する手法は「Islands Architecture（アイランドアーキテクチャ）」と呼ばれています[^3]。静的なHTMLの海の中に、動きが必要なパーツだけを「島（アイランド）」として配置するイメージです。AstroではこのアイランドにReactでもVueでも好きなUIライブラリを使えます。

[^3]: https://jasonformat.com/islands-architecture/

### Svelte

Svelteは、UIフレームワークですが、「コンパイラ」が本体です。

> Svelte はコンパイラを使用し、HTML、CSS、JavaScript で記述された宣言的なコンポーネントを...無駄のない、タイトで最適化された JavaScript に変換します。

ReactやVueは、ビルド結果の中にフレームワーク本体（ランタイム）が含まれ、ブラウザ上で動き続けます。Svelteはコンパイル時に「どの値が変化しうるか」「その変化でDOMのどこを更新すればいいか」を解析し、その操作だけを行う素のJavaScriptに変換します。仮想DOMを使わず、ビルド結果には数KB程度のほんの小さなランタイムしか含まれないため出力が軽量になるようです。

ちなみにSvelte公式のチュートリアルはブラウザ上でコードを書きながら学べるようになっていて優しいです。コピペすると怒られるところがかなりキュンですよ🫰。

## プロジェクト作成してディレクトリ構成を見てみる

Astroの公式手順に沿って、以下のコマンドでプロジェクトを作成しました。

```bash
npm create astro@latest -- --add svelte
```

インタラクティブなプロンプトが流れるので、テンプレートは`minimal (empty) template`を選びました。（まさにブログを作るためのテンプレートも用意されているのですが、学習目的なので選びませんでした。）作成されたのは以下のような構成です。`AGENTS.md`や`CLAUDE.md`が生成されているのが今っぽいですね。

```
.vscode/
node_modules/
public/
  ├ favicon.ico
  └ favicon.svg
src/
  └ pages/
    └ index.astro
.gitignore
AGENTS.md
astro.config.mjs
CLAUDE.md
package-lock.json
package.json
README.md
svelte.config.js
tsconfig.json
```


Astroが予約しているディレクトリは`src/pages/`だけです[^4]。

[^4]: https://docs.astro.build/ja/basics/project-structure/#srcpages

「URLになるものだけ`src/pages/`に置いてください。あとは自由にどうぞ」というスタンスで、制約が少なく使い始めやすいと感じました。

また、`astro.config.mjs`を見ると、Svelteを使う設定が既に書かれていました。

```js
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [svelte()],
});
```

他のフレームワークも使いたくなったら、`integrations`に追加していくみたいです[^5]。

[^5]: https://docs.astro.build/ja/reference/configuration-reference/#integrations


## AstroからSvelteコンポーネントを使ってみる

実際にSvelteコンポーネントを作って、Astroから読み込んでみました。

まず`src/components/test.svelte`を作成します。Svelteの公式チュートリアルにある一番シンプルな例です。

```svelte
<!-- src/components/test.svelte -->
<script>
let name = "Svelte";
</script>

<h1>Hello {name}!</h1>
```
なんだか、ただのHTMLみたいですね。
次に、`src/pages/index.astro`から読み込みます。

```astro
<!-- src/pages/index.astro -->
---
import Test from "@components/test.svelte";
---

<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>Astro</title>
  </head>
  <body>
    <h1>Astro</h1>
    <Test client:load />
  </body>
</html>
```

ポイントは`client:load`です。AstroはデフォルトでJavaScriptを取り除くので、Svelteのような動的なコンポーネントを使う場合は`client:*`ディレクティブで明示する必要があります。`client:load`はページ読み込みと同時にコンポーネントをハイドレーション（JavaScriptを有効化）する指定です。

## 動作確認

```bash
npm run dev
```

ブラウザで`http://localhost:4321`を開くと「Astro Hello Svelte!」と表示されました。AstroとSvelteが連携して動いていることを確認できました。

## おわりに

Astroのプロジェクトを作成し、SvelteコンポーネントをAstroページから呼び出すところまで試してみました。コマンド一発でSvelteとの連携まで整うのは便利でした。

次回は、このブログをGitHub Pagesにデプロイする手順を記録する予定です。
