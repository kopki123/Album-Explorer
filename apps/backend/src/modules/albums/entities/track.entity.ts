import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { AlbumEntity } from './album.entity';

@Entity('tracks')
@Unique(['album', 'trackNo'])
export class TrackEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => AlbumEntity, (a) => a.tracks, { onDelete: 'CASCADE' })
  @Index()
  album!: AlbumEntity;

  @Column({ type: 'int' })
  trackNo!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'int', nullable: true })
  durationMs!: number | null;
}
