import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AlbumEntity } from '../albums/entities/album.entity';
import { FavoriteEntity } from './entities/favorite.entity';
import { RatingEntity } from './entities/rating.entity';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(UserEntity) private users: Repository<UserEntity>,
    @InjectRepository(AlbumEntity) private albums: Repository<AlbumEntity>,
    @InjectRepository(RatingEntity) private ratings: Repository<RatingEntity>,
    @InjectRepository(FavoriteEntity) private favorites: Repository<FavoriteEntity>,
  ) {}

  private async requireUser(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  private async requireAlbum(albumId: number) {
    const album = await this.albums.findOne({ where: { id: albumId } });
    if (!album) throw new NotFoundException('Album not found');
    return album;
  }

  async fetchMe(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };
  }

  // ---------- Ratings ----------
  async upsertRating(userId: string, albumId: number, input: { score: number; review?: string | null }) {
    const user = await this.requireUser(userId);
    const album = await this.requireAlbum(albumId);

    let rating = await this.ratings.findOne({
      where: { user: { id: user.id }, album: { id: album.id } },
      relations: { album: true },
    });

    if (!rating) {
      rating = this.ratings.create({
        user,
        album,
        score: input.score,
        review: input.review ?? null,
      });
    } else {
      rating.score = input.score;
      rating.review = input.review ?? null;
    }

    const saved = await this.ratings.save(rating);
    return {
      albumId: saved.album.id,
      score: saved.score,
      review: saved.review,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async deleteRating(userId: string, albumId: number) {
    const user = await this.requireUser(userId);

    const rating = await this.ratings.findOne({
      where: { user: { id: user.id }, album: { id: albumId } },
    });

    if (!rating) return { ok: true, deleted: false };

    await this.ratings.remove(rating);
    return { ok: true, deleted: true };
  }

  async listRatings(userId: string, args: { page: number; pageSize: number; sort?: string }) {
    const page = Math.max(1, args.page);
    const pageSize = Math.min(100, Math.max(1, args.pageSize));

    const qb = this.ratings
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.album', 'a')
      .innerJoin('r.user', 'u', 'u.id = :userId', { userId });

    switch (args.sort) {
      case 'createdAt_asc':
        qb.orderBy('r.createdAt', 'ASC');
        break;
      case 'score_desc':
        qb.orderBy('r.score', 'DESC').addOrderBy('r.updatedAt', 'DESC');
        break;
      case 'score_asc':
        qb.orderBy('r.score', 'ASC').addOrderBy('r.updatedAt', 'DESC');
        break;
      case 'updatedAt_desc':
      default:
        qb.orderBy('r.updatedAt', 'DESC');
    }

    qb.skip((page - 1) * pageSize).take(pageSize);

    const [rows, total] = await qb.getManyAndCount();

    return {
      data: {
        items: rows.map((r) => ({
          album: r.album,
          score: r.score,
          review: r.review,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
      },
      meta: {
        pagination: {
          page,
          pageSize,
          total,
        },
      },
    };
  }

  async fetchRating(userId: string, albumId: number) {
    const rating = await this.ratings.findOne({
      where: { user: { id: userId }, album: { id: albumId } },
      relations: { album: true },
    });

    return {
      data: {
        albumId,
        isRated: !!rating,
        rating: rating
          ? {
              score: rating.score,
              review: rating.review,
              createdAt: rating.createdAt,
              updatedAt: rating.updatedAt,
            }
          : null,
        album: rating?.album
          ? {
              id: rating.album.id,
              slug: rating.album.slug,
              title: rating.album.title,
              artistName: rating.album.artistName,
              coverUrl: rating.album.coverUrl,
            }
          : null,
      },
    };
  }

  // ---------- Favorites ----------
  async addFavorite(userId: string, albumId: number) {
    const user = await this.requireUser(userId);
    const album = await this.requireAlbum(albumId);

    const existing = await this.favorites.findOne({
      where: { user: { id: user.id }, album: { id: album.id } },
    });

    if (existing) return { ok: true, created: false };

    const fav = this.favorites.create({ user, album });
    await this.favorites.save(fav);
    return { ok: true, created: true };
  }

  async removeFavorite(userId: string, albumId: number) {
    const user = await this.requireUser(userId);

    const fav = await this.favorites.findOne({
      where: { user: { id: user.id }, album: { id: albumId } },
    });

    if (!fav) return { ok: true, deleted: false };

    await this.favorites.remove(fav);
    return { ok: true, deleted: true };
  }

  async listFavorites(userId: string, args: { page: number; pageSize: number; sort?: string }) {
    const page = Math.max(1, args.page);
    const pageSize = Math.min(100, Math.max(1, args.pageSize));

    const qb = this.favorites
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.album', 'a')
      .innerJoin('f.user', 'u', 'u.id = :userId', { userId });

    switch (args.sort) {
      case 'createdAt_asc':
        qb.orderBy('f.createdAt', 'ASC');
        break;
      case 'createdAt_desc':
      default:
        qb.orderBy('f.createdAt', 'DESC');
    }

    qb.skip((page - 1) * pageSize).take(pageSize);

    const [rows, total] = await qb.getManyAndCount();

    return {
      data: {
        items: rows.map((f) => ({
          album: f.album,
          createdAt: f.createdAt,
        })),
      },
      meta: {
        pagination: {
          page,
          pageSize,
          total,
        },
      },
    };
  }

  async fetchFavorite(userId: string, albumId: number) {
    const fav = await this.favorites.findOne({
      where: { user: { id: userId }, album: { id: albumId } },
      relations: { album: true },
    });

    return {
      data: {
        albumId,
        isFavorited: !!fav,
        favoritedAt: fav?.createdAt ?? null,
        album: fav?.album
          ? {
              id: fav.album.id,
              slug: fav.album.slug,
              title: fav.album.title,
              artistName: fav.album.artistName,
              coverUrl: fav.album.coverUrl,
            }
          : null,
      },
    };
  }
}
