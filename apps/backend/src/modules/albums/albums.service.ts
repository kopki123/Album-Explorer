import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { AlbumEntity } from '../albums/entities/album.entity';

type ListArgs = {
  q?: string;
  sort?: string;
  page: number;
  pageSize: number
};

function toPublicAlbum(a: AlbumEntity) {
  return {
    id: a.id,         // ✅ 仍回傳 id
    slug: a.slug,     // ✅ 前端路由用 slug
    title: a.title,
    artistName: a.artistName,
    releaseDate: a.releaseDate,
    description: a.description,
    durationMs: a.durationMs,
    coverUrl: a.coverUrl,
    wikiUrl: a.wikiUrl,
    spotifyId: a.spotifyId,
  };
}

@Injectable()
export class AlbumsService {
  constructor(@InjectRepository(AlbumEntity) private albums: Repository<AlbumEntity>) {}

  async list(args: ListArgs) {
    const page = Math.max(1, args.page);
    const pageSize = Math.min(100, Math.max(10, args.pageSize));

    const applySort = (qb: any) => {
      switch (args.sort) {
        case 'releaseDate_asc':
          qb.orderBy('a.releaseDate', 'ASC');
          break;
        case 'releaseDate_desc':
          qb.orderBy('a.releaseDate', 'DESC');
          break;
        case 'title_asc':
          qb.orderBy('a.title', 'ASC');
          break;
        case 'title_desc':
          qb.orderBy('a.title', 'DESC');
          break;
        default:
          qb.orderBy('a.releaseDate', 'DESC');
      }
      qb.addOrderBy('a.id', 'ASC');
    };

    const baseQb = this.albums.createQueryBuilder('a');

    if (args.q) {
      const keyword = `%${args.q}%`;
      baseQb.andWhere(
        new Brackets((b) => {
          b.where('a.title ILIKE :keyword', { keyword })
            .orWhere('a.artistName ILIKE :keyword', { keyword });
        }),
      );
    }

    applySort(baseQb);

    const total = await baseQb.clone().getCount();

    const idRows = await baseQb
      .clone()
      .select('a.id', 'id')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawMany<{ id: number }>();

    const ids = idRows.map((r) => r.id);
    if (ids.length === 0) {
      return {
        data: { items: [] },
        meta: { pagination: { page, pageSize, total } },
      };
    }

    const qb = this.albums
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.genres', 'g')
      .leftJoinAndSelect('a.tracks', 't')
      .where('a.id IN (:...ids)', { ids });

    applySort(qb);
    qb.addOrderBy('t.trackNo', 'ASC');

    const items = await qb.getMany();

    return {
      data: {
        items: items.map((album) => ({
          ...toPublicAlbum(album),
          genres: album.genres?.map((x) => ({ id: x.id, name: x.name, slug: x.slug })) ?? [],
          tracks: album.tracks?.map((x) => ({
            id: x.id,
            trackNo: x.trackNo,
            title: x.title,
            durationMs: x.durationMs,
          })) ?? [],
        })),
      },
      meta: {
        pagination: { page, pageSize, total },
      },
    };
  }

  async detailById(id: number) {
    const album = await this.albums.findOne({ where: { id } });

    if (!album) throw new NotFoundException('Album not found');

    return toPublicAlbum(album);
  }

  async detailBySlug(slug: string) {
    const album = await this.albums
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.genres', 'g')
      .leftJoinAndSelect('a.tracks', 't')
      .where('a.slug = :slug', { slug })
      .orderBy('t.trackNo', 'ASC')
      .getOne();

    if (!album) throw new NotFoundException('Album not found');

    return {
      ...toPublicAlbum(album),
      genres: album.genres?.map((x) => ({ id: x.id, name: x.name, slug: x.slug })) ?? [],
      tracks: album.tracks?.map((x) => ({
        id: x.id,
        trackNo: x.trackNo,
        title: x.title,
        durationMs: x.durationMs,
      })) ?? [],
    };
  }

  async randomOne() {
    const album = await this.albums
      .createQueryBuilder('a')
      .orderBy('RANDOM()')
      .limit(1)
      .getOne();

    if (!album) throw new NotFoundException('No albums found');

    return toPublicAlbum(album);
  }
}
