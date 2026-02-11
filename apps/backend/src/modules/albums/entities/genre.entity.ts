import { Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AlbumEntity } from './album.entity';

@Entity('genres')
export class GenreEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 80 })
  name!: string;

  @Column({ type: 'varchar', length: 120 })
  @Index({ unique: true })
  slug!: string;

  @ManyToMany(() => AlbumEntity, (a) => a.genres)
  albums!: AlbumEntity[];
}