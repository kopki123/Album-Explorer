import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

type AlbumJson = {
  title: string;
  artistName: string;
  releaseDate: string;         // "YYYY-MM-DD"
  description: string | null;
  durationMs: number | null;
  coverUrl: string | null;
  wikiUrl: string | null;
  spotifyId?: string | null;
  genres: string[];
  tracks: { trackNo: number; title: string; durationMs: number | null }[];
};

function slugify(input: string) {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseBooleanEnv(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  return value === 'true';
}

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) throw new Error('Missing DATABASE_URL');

  // json 放哪裡就改這行
  const jsonPath = path.resolve(process.cwd(), 'data/albums.json');
  const albums: AlbumJson[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const isProd = process.env.NODE_ENV === 'production';
  const sslEnabled = parseBooleanEnv(process.env.DB_SSL) ?? isProd;
  const sslRejectUnauthorized =
    parseBooleanEnv(process.env.DB_SSL_REJECT_UNAUTHORIZED) ?? isProd;

  const client = new Client({
    connectionString: DATABASE_URL,
    ...(sslEnabled ? { ssl: { rejectUnauthorized: sslRejectUnauthorized } } : {}),
  });

  await client.connect();

  // genre slug -> id cache，避免一直查
  const genreIdCache = new Map<string, number>();

  const getOrCreateGenreId = async (nameRaw: string) => {
    const name = nameRaw.trim();
    const slug = slugify(name);
    if (!slug) throw new Error(`Invalid genre name: "${nameRaw}"`);

    const cached = genreIdCache.get(slug);
    if (cached) return cached;

    const found = await client.query(
      `select id from public.genres where slug = $1 limit 1`,
      [slug],
    );
    if (found.rowCount) {
      const id = found.rows[0].id as number;
      genreIdCache.set(slug, id);
      return id;
    }

    const inserted = await client.query(
      `insert into public.genres (name, slug)
       values ($1, $2)
       returning id`,
      [name, slug],
    );
    const id = inserted.rows[0].id as number;
    genreIdCache.set(slug, id);
    return id;
  };

  try {
    await client.query('begin');

    for (const a of albums) {
      const year = a.releaseDate?.slice(0, 4) ?? '0000';
      const albumSlug = slugify(`${a.artistName}-${a.title}-${year}`);

      // 1) 先找 album
      const foundAlbum = await client.query(
        `select id from public.albums where slug = $1 limit 1`,
        [albumSlug],
      );

      let albumId: number;

      if (foundAlbum.rowCount) {
        albumId = foundAlbum.rows[0].id as number;

        // 更新主表欄位（欄位是 camelCase，所以要用 "..."）
        await client.query(
          `update public.albums
           set title = $2,
               "artistName" = $3,
               "releaseDate" = $4,
               description = $5,
               "durationMs" = $6,
               "coverUrl" = $7,
               "wikiUrl" = $8,
               "spotifyId" = $9
           where slug = $1`,
          [
            albumSlug,
            a.title,
            a.artistName,
            a.releaseDate,
            a.description,
            a.durationMs,
            a.coverUrl,
            a.wikiUrl,
            a.spotifyId ?? null,
          ],
        );

        // 既有資料：先清 tracks + 關聯表，再重建（簡單、可重複執行）
        await client.query(`delete from public.tracks where "albumId" = $1`, [albumId]);
        await client.query(`delete from public.album_genres where album_id = $1`, [albumId]);
      } else {
        const insertedAlbum = await client.query(
          `insert into public.albums
            (slug, title, "artistName", "releaseDate", description, "durationMs", "coverUrl", "wikiUrl", "spotifyId")
           values
            ($1,   $2,    $3,          $4,          $5,          $6,           $7,        $8,       $9)
           returning id`,
          [
            albumSlug,
            a.title,
            a.artistName,
            a.releaseDate,
            a.description,
            a.durationMs,
            a.coverUrl,
            a.wikiUrl,
            a.spotifyId ?? null,
          ],
        );
        albumId = insertedAlbum.rows[0].id as number;
      }

      // 2) genres + album_genres
      for (const g of a.genres ?? []) {
        const genreId = await getOrCreateGenreId(g);
        await client.query(
          `insert into public.album_genres (album_id, genre_id)
           values ($1, $2)
           on conflict do nothing`,
          [albumId, genreId],
        );
      }

      // 3) tracks
      for (const t of a.tracks ?? []) {
        await client.query(
          `insert into public.tracks ("albumId", "trackNo", title, "durationMs")
           values ($1,        $2,       $3,    $4)`,
          [albumId, t.trackNo, t.title, t.durationMs],
        );
      }
    }

    await client.query('commit');
    console.log(`✅ Seed done. albums=${albums.length}`);
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
