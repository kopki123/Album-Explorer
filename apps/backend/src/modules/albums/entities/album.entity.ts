import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TrackEntity } from './track.entity';
import { GenreEntity } from './genre.entity';

@Entity('albums')
export class AlbumEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  @Index({ unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 200 })
  @Index()
  artistName!: string;

  @Column({ type: 'date' })
  @Index()
  releaseDate!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'int', nullable: true })
  durationMs!: number | null;

  @Column({ type: 'varchar', nullable: true })
  coverUrl!: string | null;

  @Column({ type: 'varchar', nullable: true })
  @Index({ unique: true })
  wikiUrl!: string | null; // nullable unique：Postgres 允許多個 NULL

  @ManyToMany(() => GenreEntity, (g) => g.albums)
  @JoinTable({
    name: 'album_genres',
    joinColumn: { name: 'album_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genre_id', referencedColumnName: 'id' },
  })
  genres!: GenreEntity[];

  @OneToMany(() => TrackEntity, (t) => t.album)
  tracks!: TrackEntity[];
}
