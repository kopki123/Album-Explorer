import { CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { AlbumEntity } from '../../albums/entities/album.entity';

@Entity('favorites')
@Unique(['user', 'album'])
export class FavoriteEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @Index()
  user!: UserEntity;

  @ManyToOne(() => AlbumEntity, { onDelete: 'CASCADE' })
  @Index()
  album!: AlbumEntity;

  @CreateDateColumn()
  createdAt!: Date;
}
