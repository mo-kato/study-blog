---
title: "Panda CSSのconfigで何を拡張できるか"
createdAt: "2026-09-16 20:00"
updatedAt: "2026-09-16 20:00"
tags:
  - "astro"
  - "panda-css"
  - "css"
  - "design-tokens"
  - "frontend"
執筆スタンス: |
  - この文章は個人の技術ブログの記事です
  - 文体：原則として敬体（です・ます調）に統一すること。
  - スタンス：学習者が学習したことを記事にしているという体裁を保つこと。「物知りな私が皆さんに教えてあげます」というスタンスは取らないこと。
  - フランクさを**少し**残す：しかし、過度にくだけた表現にはしないこと。
  - 見出しレベルは2から：titleが`<h1>`になるため、本文は`##`から下のみを見出しにする。
---

## はじめに

[前回](../20260915-panda-css/)でPanda CSSを導入し、`css()`でスタイルを書けるところまで進みました。ただ、導入しただけでは、Pandaが最初から持っている値と書き方しか使えません。

Pandaは`panda.config.ts`を通じて、かなりの部分を拡張できるようになっています。何が拡張できて、それぞれ何のために用意されているのかについて、このブログで実際に設定した内容を一通り見ていきます。

## デザイントークン: 値に名前を付ける

公式ドキュメントの[Tokens](https://panda-css.com/docs/theming/tokens)は、次のように説明しています。

> Design tokens are the platform-agnostic way to manage design decisions in your application or website.

色やフォントといった「デザイン上の決めごと」を、CSSから切り離してキーと値の組で持つ仕組みです。Pandaのトークンは[W3C Token Format](https://tr.designtokens.org/format/)の影響を受けているとも書かれています。

トークンは`value`と、任意の`description`で構成されます。値を`{ value: ... }`で包む必要があるのはそのためです。

```ts
import { defineTokens } from "@pandacss/dev";

export default defineTokens({
  fonts: {
    sans: { value: '"Noto Sans JP", sans-serif' },
    mono: { value: '"JetBrains Mono", monospace' },
    title: { value: '"Righteous", sans-serif' },
  },
  colors: {
    primary: {
      "950": { value: "#060428" },
      "900": { value: "#181a3d" },
      // 800 から 100 まで続く
      "50": { value: "#fcfcfe" },
    },
    // lime, cyan, marineLime も同様
  },
  borders: {
    hairline: { value: "1px solid transparent" },
  },
});
```

ビルドすると、CSS変数として出力されます。

```css
--colors-primary-900:#181a3d
```

色は`primary`・`lime`・`cyan`・`marineLime`の4系統を、それぞれ`50`から`950`までの11段階で用意しました。`primary`が地の色、`lime`と`cyan`がアクセント、`marineLime`はコードブロックの背景などに使う中間色という位置づけです。

## セマンティックトークン: 用途に名前を付ける

同じページの[Semantic Tokens](https://panda-css.com/docs/theming/tokens#semantic-tokens)に、こうあります。

> Semantic tokens are tokens that are designed to be used in a specific context.

> In most cases, the value of a semantic token references to an existing token.

デザイントークンだけで組むと、コンポーネント側に`primary.900`のような具体的な色名が散らばります。セマンティックトークンは、その手前に「用途」の層を挟むものです。

### 基本の書き方

値には、既存のトークンへの参照を書きます。参照には波括弧の記法を使います。公式ドキュメントにも「To reference a value in a semantic token, use the `{}` syntax.」とあります。

```ts
  colors: {
    text: {
      value: "{colors.primary.200}",
    },
  },
```

これで、コンポーネント側は`color: "text"`と書けるようになります。何色かではなく、何のための色かを書く形です。色を変えたくなったら、参照先を差し替えれば全体に反映されます。

### 条件によって値を変える

ここまでは値が1つでしたが、値の部分を条件ごとに分けて書くこともできます。

> Semantic tokens can also be changed based on the conditions like light and dark modes.

ダークモードとライトモードで色を変えたい場合は、この形になります。このブログでは`base`にダークモードの色を、`_light`にライトモードの色を置きました。

```ts
import { defineSemanticTokens } from "@pandacss/dev";

export default defineSemanticTokens({
  colors: {
    text: {
      DEFAULT: {
        value: {
          base: "{colors.primary.200}",
          _light: "{colors.primary.800}",
        },
      },
    },
    background: {
      canvas: {
        value: {
          base: "{colors.primary.900}",
          _light: "{colors.primary.50}",
        },
      },
      header: {
        value: {
          base: "{colors.primary.950}",
          _light: "{colors.primary.50}",
        },
      },
    },
    border: {
      DEFAULT: {
        value: {
          base: "{colors.primary.800}",
          _light: "{colors.primary.200}",
        },
      },
      hover: {
        value: {
          base: "{colors.primary.700}",
          _light: "{colors.primary.300}",
        },
      },
    },
  },
});
```

`DEFAULT`は、そのキー自身に値を持たせるための予約語です。生成されたトークン名は、`border.DEFAULT`ではなく`border`になります。

```ts
// styled-system/tokens/tokens.d.ts（抜粋）
"text" | "background.canvas" | "background.header" | "border" | "border.hover"
```

生成されたCSSを見ると、CSS変数が二重になる形で出力されていました。

```css
/* 既定（ダーク） */
--colors-text: var(--colors-primary-200);

/* ライトのとき、変数の中身だけを差し替える */
[data-color-mode=light] {
  --colors-text: var(--colors-primary-800);
  --colors-background-canvas: var(--colors-primary-50);
  --colors-background-header: var(--colors-primary-50);
  --colors-border: var(--colors-primary-200);
  --colors-border-hover: var(--colors-primary-300);
}
```

`color: var(--colors-text)`と書いたクラスは1つしか生成されず、`--colors-text`の中身だけがルート要素の属性によって切り替わります。テーマごとにクラスを2つ作るのではなく、変数の値を差し替える形です。

## conditions: 条件に名前を付ける

ここまで`_light`という条件を使ってきました。Pandaには、特定の条件を満たすときだけ適用するスタイルを書く仕組みがあり、その条件には`_`で始まる名前が付いています。キーの下にスタイルを書くと、その条件のときだけ適用されます。

このブログでも次の4つを使っています。

| 条件 | 実体 |
| --- | --- |
| `_hover` | `&:is(:hover, [data-hover])` |
| `_open` | `&:is([open], [data-open], [data-state="open"], :popover-open)` |
| `_last` | `&:last-child` |
| `_before` | `&::before` |

実体は、このようなセレクタの文字列か、`@media`のようなat-ruleです。セレクタの場合は、`&`の部分が対象の要素に置き換わります。

`light`と`dark`も、既定で用意されている条件です。公式ドキュメントの[条件の一覧](https://panda-css.com/docs/concepts/conditional-styles#reference)に、対応するセレクタが載っています。

| 条件 | セレクタ |
| --- | --- |
| `_dark` | `.dark &` |
| `_light` | `.light &` |
| `_osDark` | `@media (prefers-color-scheme: dark)` |
| `_osLight` | `@media (prefers-color-scheme: light)` |

既定はクラスベースで、`.light`というクラスを祖先に付けると`_light`が有効になります。OSの設定を見る`_osDark`・`_osLight`も別に用意されています。

ダークモードとライトモードをどう切り替えるかを調べたうえで、このブログでは既定のクラスではなく、ルート要素の属性で切り替える方式に変更しました。そのため`light`の条件を上書きしています。

```ts
  conditions: {
    light: "[data-color-mode=light] &",
  },
```

「祖先に`data-color-mode="light"`が付いているときの自分自身」という意味になります。

この上書きによって、セマンティックトークンの`_light`だけでなく、`css()`の中でも`_light`が属性ベースで動くようになります。

```ts
const title = css({
  color: "lime.500",
  _light: {
    color: "cyan.500",
  },
});
```

```css
[data-color-mode=light] .light\:c_cyan\.500 {
  color: var(--colors-cyan-500);
}
```

このブログは`<html>`に`data-color-mode="dark"`を指定していて、ダークが基本の状態です。ライトモードのぶんだけを`_light`で足していく、という書き方になります。

なお、前述のセマンティックトークンで使える条件には制約があります。公式ドキュメントに「The conditions used in semantic tokens must be an at-rule or parent selector condition.」とあり、at-ruleか親セレクタの条件でなければなりません。`[data-color-mode=light] &`は親セレクタの形なので、この条件を満たしています。


## breakpoints: 画面幅の区切り

公式ドキュメントの[Responsive Design](https://panda-css.com/docs/concepts/responsive-design)によると、Pandaはモバイルファーストで`min-width`のメディアクエリを使います。

> Panda uses a mobile-first breakpoint system and leverages min-width media queries `@media(min-width)` when you write responsive styles.

既定では5つ用意されています。

```ts
sm: '640px'
md: '768px'
lg: '1024px'
xl: '1280px'
'2xl': '1536px'
```

このブログでは`md`を600pxにしました。新しい区切りを足したのではなく、既定の768pxを上書きしたことになります。

```ts
  theme: {
    extend: {
      breakpoints: {
        md: "600px",
      },
      // ...
    },
  },
```

記事を読むためのページでは「狭いか広いか」の2通りあれば良いと考えたので、使っているのは`md`だけです。本文の横幅も、この区切りでセマンティックトークンとして定義しました。

```ts
  sizes: {
    mainInner: {
      value: {
        base: "100vw",
        md: "85vw",
      },
    },
  },
```

出力されたCSSでは、メディアクエリの中で変数が上書きされていました。

```css
--sizes-main-inner: 100vw;
/* md 以上のとき */
--sizes-main-inner: 85vw;
```

## textStyles: 文字まわりのまとまりに名前を付ける

複数のプロパティをひとまとめにして名前を付ける仕組みとして、Pandaには3つが用意されています。Theming配下の独立したページになっていて、それぞれこう説明されています。

| 機能 | 公式ドキュメントの説明 |
| --- | --- |
| [Text Styles](https://panda-css.com/docs/theming/text-styles) | Define reusable typography css properties. |
| [Layer Styles](https://panda-css.com/docs/theming/layer-styles) | Define reusable container styles properties. |
| [Animation Styles](https://panda-css.com/docs/theming/animation-styles) | Define reusable animation css properties. |

このブログで使っているのは今のところ`textStyles`だけです。記事の見出しや日付部分など、ある一定の書式を当てる場合に定義するのが良さそうです。

```ts
import { defineTextStyles } from "@pandacss/dev";

export default defineTextStyles({
  time: {
    description: "ブログ記事の日付",
    value: {
      fontSize: "sm",
      fontWeight: "extralight",
    },
  },
});
```

使う側は`textStyle: "time"`と書くだけです。生成されるCSSは、プロパティごとのクラスではなく1つのクラスにまとまります。

```css
.textStyle_time {
  font-size: var(--font-sizes-sm);
  font-weight: var(--font-weights-extralight);
}
```

`description`はコード上の説明で、CSSには出力されません。

なお`textStyles`に書けるのは文字に関するプロパティだけでした。公式ドキュメントはこれを「[Avoid layout properties](https://panda-css.com/docs/theming/text-styles#avoid-layout-properties)」という推奨として書いていますが、型の上でも制限されています。試しに`backgroundColor`を足して`tsc`を走らせると、こうなりました。

```text
error TS2769: No overload matches this call.
  Type 'string' is not assignable to type
  'Nested<FilterStyleObject<TextStyleProperty> & CssVarProperties> | undefined'.
```

## utilities: 書き方そのものを増やす

ここまでは値や組み合わせに名前を付ける話でしたが、`utilities`は書き方そのものを追加するものです。公式ドキュメントの[Utilities](https://panda-css.com/docs/customization/utilities)はこう説明しています。

> The utility API is a way to create your own CSS properties, map existing properties to a set of values or tokens.

このブログには`1px`のボーダーを引く箇所がいくつもあります。ヘッダーの下線、記事一覧の区切り、本文の`<hr>`、タグの枠です。色はトークンを指定したいので、素直に書くと毎回こうなります。

```ts
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBottomColor: "primary.500",
```

太さと線種は常に`1px solid`で、方向と色だけを変えたい場面はよくあります。しかし、`1px`のような固定値を都度直接書くのは避けたいですし、太さや線の種類ごとに毎回プロパティを書くのも手間がかかります。そこで、方向ごとにユーティリティを用意し、色だけを渡せば済むようにしました。

```ts
import { defineUtility } from "@pandacss/dev";

export default {
  hairline: defineUtility({
    values: "colors",
    transform: (value) => ({ border: `1px solid ${value}` }),
  }),
  hairlineTop: defineUtility({
    values: "colors",
    transform: (value) => ({ borderTop: `1px solid ${value}` }),
  }),
  // 下・左・右・左右・上下も同様
};
```
これで、呼び出し側は1行で済むようになりました。

```ts
css({
  hairlineBottom: "primary.500",
});
```

生成されるCSSは次のとおりです。

```css
.hairline-bottom_border {
  border-bottom: 1px solid var(--colors-primary-500);
}
```

公式ドキュメントが挙げているutilitiesの設定項目は4つです。

| キー | 公式ドキュメントの説明 |
| --- | --- |
| `className` | The className the property maps to |
| `shorthand` | The shorthand or alias version of the property |
| `values` | The possible values the property can have. Could be a token category, or an enum of values, string, number, or boolean. |
| `transform` | A function that converts the value to a valid css object |

`values: "colors"`はトークンのカテゴリを指す指定で、これによって色のトークン名が候補として補完されます。`transform`が実際のCSSオブジェクトを返す部分です。

## patterns: レイアウトの型に名前を付ける

パターンについて、公式ドキュメントの[Patterns](https://panda-css.com/docs/concepts/patterns)はこう書いています。

> Patterns are layout primitives that can be used to create robust and responsive layouts with ease.

> Think of patterns as a set of predefined styles to reduce repetition and improve readability.

`css()`に毎回書いているスタイルの組み合わせを、名前の付いた関数として切り出す仕組みです。例えば、横並びのFlexで天地中央揃えにしたいという場面はよくあります。Panda CSSで普通に書くとこうです。

```ts
const wrapper = css({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
});
```

天地中央揃えの横並びFlexは非常によく使うお決まりのパターンで、デフォルトになっていても良いと思えるほどです。共通化したい、でも場合に応じて`padding`や`margin`、その他のスタイルを加えたい。そんな需要に応えるのが`patterns`です。

公式ドキュメントに「layout primitives」とあるとおり、想定されているのは主にレイアウトの用途です。組み込みのパターンも`stack`や`hstack`といった、要素の並べ方に関するものが中心です。[カスタマイズのページ](https://panda-css.com/docs/customization/patterns)にも「This is useful to create your own layout pattern abstractions that can be used in your application.」とあります。

このブログではこんな定義を作ってみました。`layoutInner`は、ページの中身が収まる枠を決めるためのものです。ヘッダー・フッター・記事本文のすべてがこれを使っているので、横幅と中央寄せが揃います。

```ts
import { definePattern } from "@pandacss/dev";

export const layoutInner = definePattern({
  transform(props) {
    const { ...rest } = props;
    return {
      w: "mainInner",
      maxW: "4xl",
      mx: "auto",
      px: {
        base: 5,
        md: 0,
      },
      ...rest,
    };
  },
});
```

## slotRecipes: 複数の要素からなる部品

`theme.slotRecipes`にも定義を1つ登録しています。複数の要素の組み合わせでできた部品にスタイルを付けるための仕組みで、このブログではタグの表示に使っています。

要素ごとにスタイルを書いておくと、呼び出したときにそれぞれのクラス名が返ります。ここまでの拡張と違ってコンポーネント側の書き方にも関わるので、実際にタグを作る回でまとめて扱います。

## globalCss: 全体にかかるスタイル

`css()`で書いたスタイルはクラスとして出力され、そのクラスを付けた要素にだけ当たります。これに対し`globalCss`は、セレクタを指定してスタイルを直接出力する場所です。公式ドキュメントの[Global Styles](https://panda-css.com/docs/concepts/global-styles)にも「Use `globalCss` to define additional global styles and set variables.」とあります。

クラスを付けて回らずに済ませたいもの、つまりサイト全体の既定値をここに書きます。
今回は基本の背景色と文字色、クリッカブルな要素のカーソルスタイルを主に定義しています。

セマンティックトークンを使っているため、テーマの切り替えも自動的に効きます。

```ts
const globalCss = {
  html: {
    fontFamily: "sans",
    color: "text",
    bgColor: "background.canvas",
  },
  button: {
    cursor: "pointer",
    _disabled: {
      cursor: "default",
    },
  },
  summary: {
    cursor: "pointer",
    display: "block",
    "&::-webkit-details-marker": {
      display: "none",
    },
  },
  select: {
    cursor: "pointer",
    _disabled: {
      cursor: "default",
    },
  },
};
```

なお`globalCss`の出力先は`@layer base`で、`preflight`によるリセットは`@layer reset`に入ります。[前回](../20260915-panda-css/)のエントリーCSSで宣言したレイヤーの順序によって、リセットより後、個別に書いたスタイルより前、という優先順位になります。

## `extend`を付けるかどうか

`panda.config.ts`のいくつかのキーには、`extend`という入れ子を挟んで書けます。付ける場合と付けない場合で何が違うのかを調べました。

[extendのページ](https://panda-css.com/docs/concepts/extend)には、こう書かれています。

> The `extend` keyword allows you to extend the default Panda configuration.

> It will (deeply) merge your customizations with the default ones, instead of replacing them.

つまり`extend`は深いマージ、`extend`なしは置き換えです。影響の大きさは、そのキーの値がどれだけ入れ子になっているかで決まります。

試しに`theme`から`extend`を外して`panda codegen`を実行してみました。生成される`Token`型が、17カテゴリから5カテゴリに減りました。

```ts
// extend あり
export type Token = `aspectRatios.${...}` | `easings.${...}` | `durations.${...}`
  | `radii.${...}` | `fontWeights.${...}` | `lineHeights.${...}` | `letterSpacings.${...}`
  | `fontSizes.${...}` | `shadows.${...}` | `blurs.${...}` | `spacing.${...}`
  | `sizes.${...}` | `animations.${...}` | `fonts.${...}` | `colors.${...}`
  | `borders.${...}` | `breakpoints.${...}`

// extend なし
export type Token = `fonts.${FontToken}` | `colors.${ColorToken}`
  | `borders.${BorderToken}` | `breakpoints.${BreakpointToken}` | `sizes.${SizeToken}`
```

`fontSizes`・`radii`・`spacing`・`lineHeights`・`fontWeights`が丸ごと消えます。`theme`直下の`tokens`というキーごと、自分の定義に置き換わったためです。

厄介なのは、この状態でもビルドがエラーにならないことでした。

```css
/* extend なし */
.fs_sm{font-size:sm}

/* extend あり */
.fs_sm{font-size:var(--font-sizes-sm)}
```

トークンが解決されず、`sm`という不正な値がそのまま出力されます。気づかないまま壊れる形です。

一方`conditions`は、`extend`を付けても付けなくても結果が変わりませんでした。両方で`panda codegen`を実行して生成物を比べたところ、`_light`の宣言位置が動くだけで、セレクタの値も他の条件の構成も同じでした。`conditions`の値はセレクタの文字列で、深くマージする対象がないためです。

整理すると次のようになります。

| キー | 値の中身 | `extend`なしにすると |
| --- | --- | --- |
| `theme.tokens` | 大きな入れ子構造 | 既定のトークン一式が消える |
| `patterns.flex` | パターンの定義 | 組み込みの`flex`が自作のものに置き換わる |
| `conditions.light` | セレクタの文字列1つ | 文字列が置き換わる（それが目的） |

`conditions`で差が出ないのはたまたまで、`extend`が存在する理由は`theme`や`patterns`の側にあります。迷ったら付けておく方が安全だと思いました。

なお公式ドキュメントは`extend`を必須とはしていません。[configリファレンス](https://panda-css.com/docs/references/config#conditions)の`conditions`の例は`{ "conditions": { "hover": "&:hover" } }`と`extend`なしで書かれており、同じページの中でも`utilities`と`patterns`の例は`extend`ありでした。

## まとめ

- `panda.config.ts`で拡張できるものは複数あり、値に名前を付けるもの（トークン）、組み合わせに名前を付けるもの（テキストスタイル・パターン）、書き方を増やすもの（ユーティリティ）、全体にかかるもの（グローバルスタイル）に分かれる
- セマンティックトークンは用途に名前を付ける層で、条件ごとに値を変えられる
- `conditions`は既定の条件を上書きできる。`light`のセレクタを属性ベースに変えた
- `extend`は深いマージ、`extend`なしは置き換え。`theme`で外すと既定のトークンが消え、しかもビルドは通ってしまう

次回は、この`data-color-mode`属性を実際に切り替えるダークモードの実装を書きます。
