---
title: "GitHub Pagesのブログに独自ドメインを紐づけたらリンクが崩れた"
createdAt: "2026-09-17 20:00"
updatedAt: "2026-09-17 20:00"
tags:
  - "astro"
  - "github-pages"
  - "cloudflare"
  - "dns"
  - "custom-domain"
---

## はじめに

このブログはGitHub Pagesで公開しています。これまでは`https://<GitHubユーザー名>.github.io/<リポジトリ名>/`というURLでしたが、Cloudflareで取得した独自ドメインのサブドメインに紐づけました。

紐づけ自体はDNSレコードを1件追加するだけで終わったのですが、いざアクセスしてみるとスタイルもリンクも崩れていました。原因は`astro.config.mjs`の設定を直していなかったことです。その一連の作業を記録します。

## Cloudflare Registrarでドメインを取得した

Cloudflare Registrarで`.dev`ドメインを取得しました。費用は年間$12ほどです。他にも登録事業者はありましたが、以下の点で決めました。

- 更新時に価格が上がらない
- WHOISプライバシー保護が標準で有効になり、追加設定も追加料金も不要
- SSL/TLS証明書が無料で利用できる
- 支払い方法にPayPalを指定できる

以前、静的コンテンツをCloudflare Pagesで公開したことがあるのですが、そのときも無料でした。今回ドメインを購入するまで、支払い方法の登録すらしたことがありませんでした。 Cloudflareって……どこで利益を出しているのでしょうか？すごいですね……。

制約もあります。ネームサーバーをCloudflare以外に変更できませんし、`.jp`のような一部のTLDは取得できません。ただ、個人の開発用途では困りませんでした。

## GitHub Pagesのサイトにサブドメインを紐づける

上の表にある「DNSレコードの追加」が、GitHub Pagesのブログとドメインを紐づける作業にあたります。今回は`blog`というサブドメインに紐づけたかったので、次のように設定しました。

### 1. CloudflareでCNAMEレコードを追加する

Cloudflareダッシュボードの「DNS」＞「レコード」画面を開き、以下の内容でレコードを追加します。

| 設定項目 | 入力する内容 |
| --- | --- |
| タイプ | CNAME |
| 名前 (Name) | `blog`（これを入れることで`blog.example.dev`になります） |
| ターゲット (値) | `<GitHubユーザー名>.github.io`（リポジトリのパスは不要） |
| プロキシステータス | ON |

ターゲットにリポジトリ名を含めない点に注意が必要でした。GitHub Pagesのサイトがサブパスに置かれていても、指定するのはユーザーのPagesドメインだけです。

### 2. GitHub側でカスタムドメインを設定する

GitHubの対象リポジトリを開き、「Settings」タブ＞左メニューの「Pages」へ進みます。「Custom domain」の入力欄にサブドメインをフルで入力し（入力例：`blog.example.dev`）、「Save」をクリックします。

数分から数時間待つとDNSチェックが完了します。完了後、すぐ下にある「Enforce HTTPS」にチェックを入れます。今回使用した`.dev`はHTTPSが強制されるTLDなので、そもそもチェックを外せないようになっていました。

これで`https://blog.example.dev/`にアクセスできるようになりました。元の`https://<GitHubユーザー名>.github.io/<リポジトリ名>/`は、カスタムドメイン側へリダイレクトされます。

## アクセスしたらスタイルもリンクも崩れていた

いざアクセスしてみると、スタイルが当たっておらず、記事へのリンクもすべて404になっていました。

原因は`astro.config.mjs`を直していなかったことです。GitHub Pagesでリポジトリ名がサブパスになる前提のまま、`base`を残していました。

```js
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [svelte()],
  site: "https://<GitHubユーザー名>.github.io",
  base: "/<リポジトリ名>",
});
```

`base`はサイトが配信されるサブパスを指定するオプションで、Astroが生成するリンクやアセットのURLの先頭に付きます。ところがカスタムドメインはサイトのルートを指しているため、生成されたHTMLの`/<リポジトリ名>/posts/...`というリンクはどこにも存在しません。CSSも`/<リポジトリ名>/_astro/...`を読みに行って404になるので、スタイルも当たらなくなります。

### astro.config.mjsを直す

`base`を削除し、`site`をカスタムドメインに変更しました。

```js
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [svelte()],
  site: "https://blog.example.dev",
  // base は削除
});
```

リンク切れを直しているのは`base`の削除の方です。`site`は絶対URLを組み立てるための設定で、`Astro.site`、サイトマップ、RSSフィード、canonical URLなどに使用されます。このブログにはまだサイトマップもRSSもないため、`site`を変更しても生成物は変わりませんでした。とはいえ、後でサイトマップを追加したときに実際の配信ドメインと食い違うと困るので、合わせて変更しておきました。

### `BASE_URL`の書き方も直す

これだけでは終わりませんでした。`base`を削除すると`import.meta.env.BASE_URL`の値が`/`になります。

以前の記事で書いた通り、このブログではリンクの先頭に`BASE_URL`を付けていました。しかし、`base`が`/<リポジトリ名>`のときの`BASE_URL`は末尾にスラッシュが付かない`/<リポジトリ名>`だったため、自分でスラッシュを足す書き方をしていたのです。

```astro
<a class={title} href={`${import.meta.env.BASE_URL}/posts/${post.id}/`}>
```

この状態で`BASE_URL`が`/`になると、生成されるhrefは`//posts/...`になります。これはプロトコル相対URLとして解釈され、`https://posts/...`へのリンクになってしまいます。そこで、自分で足していたスラッシュを削りました。

```astro
<a class={title} href={`${import.meta.env.BASE_URL}posts/${post.id}/`}>
```

ヘッダーのホームへのリンクは、`${BASE_URL}/`と書くと`//`になってしまうため、`BASE_URL`をそのまま使う形にしました。

```astro
<a class={title} href={import.meta.env.BASE_URL}>ブログ名</a>
```

同様に、タグへのリンクとfaviconの指定も直しました。ビルドし直して`dist/`の中を確認したところ、`href="/"`、`href="/posts/..."`、`href="/tags/..."`、`href="/favicon.ico"`と、すべてルート基準のリンクになっていました。`//`で始まる壊れたリンクも残っていません。

`BASE_URL`は末尾スラッシュの有無が`base`の書き方に左右されるので、`${BASE_URL}`と続く文字列をどう連結するかは決めておいた方がよさそうです。

## まとめ

- Cloudflare RegistrarはWHOISプライバシー保護が標準で有効になり、更新時にも価格が上がらない。ネームサーバーを変更できない制約はあるが、個人の開発では困らなかった
- GitHub Pagesとの紐づけは、CNAMEレコードのターゲットに`<GitHubユーザー名>.github.io`を指定し、GitHubの「Settings」＞「Pages」でカスタムドメインを設定するだけで済む
- カスタムドメインはサイトのルートを指すため、`astro.config.mjs`の`base`を削除する必要がある。これを忘れるとリンクもアセットも404になる
- `base`を削除すると`import.meta.env.BASE_URL`は`/`になる。スラッシュを自分で足していた箇所は`//`になって壊れるので、合わせて直す

自分のドメインがあるとやっぱりかっこいいですね！
