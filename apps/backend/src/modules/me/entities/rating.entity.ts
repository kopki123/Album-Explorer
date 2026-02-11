import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { AlbumEntity } from '../../albums/entities/album.entity';

@Entity('ratings')
@Unique(['user', 'album'])
export class RatingEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @Index()
  user!: UserEntity;

  @ManyToOne(() => AlbumEntity, { onDelete: 'CASCADE' })
  @Index()
  album!: AlbumEntity;

  @Column({ type: 'int' })
  score!: number; // 1 ~ 5

  @Column({ type: 'text', nullable: true })
  review!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
