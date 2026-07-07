// `astro:content` からユーティリティをインポートする
import { defineCollection } from "astro:content";
// glob ローダーをインポートする
import { glob } from "astro/loaders";
// Zod をインポートする
import { z } from "astro/zod";

const jstTimestamp = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/)
  .transform((str) =>
    Temporal.PlainDateTime.from(str.replace(" ", "T"))
      .toZonedDateTime("Asia/Tokyo")
      .toString()
  );

// 各コレクションの loader と schema を定義する
const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./posts" }),
  schema: z.object({
    title: z.string(),
    createdAt: jstTimestamp,
    updatedAt: jstTimestamp,
    tags: z.array(z.string()),
    category: z.string(),
  }),
});
// コレクションを登録するため、collections オブジェクトをエクスポートする
export const collections = { posts };
