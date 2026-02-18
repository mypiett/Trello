import { AppDataSource } from '@/config/data-source';
import {
  BoardActivity,
  BoardActivityActionType,
  BoardActivityTargetType,
} from '@/common/entities/board-activity.entity';
import { User } from '@/common/entities/user.entity';
import { DeepPartial } from 'typeorm';

export class BoardActivityService {
  private repo = AppDataSource.getRepository(BoardActivity);

  async logActivity(params: {
    boardId: string;
    actorId?: string;
    actionType: BoardActivityActionType;
    targetType: BoardActivityTargetType;
    targetId?: string;
    metadata?: any;
  }) {
    const activity = this.repo.create({
      boardId: params.boardId,
      actorId: params.actorId ?? null,
      actionType: params.actionType,
      targetType: params.targetType,
      targetId: params.targetId ?? null,
      metadata: params.metadata ?? undefined,
    } as DeepPartial<BoardActivity>);

    const saved = await this.repo.save(activity);
    return saved;
  }

  async getBoardActivity(boardId: string, page = 1, limit = 20) {
    const query = this.repo.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.actor', 'actor')
      .where('activity.boardId = :boardId', { boardId })
      .orderBy('activity.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .select([
        'activity.id',
        'activity.boardId',
        'activity.actionType',
        'activity.targetType',
        'activity.targetId',
        'activity.metadata',
        'activity.createdAt',
        'activity.actorId', // Explicitly select actorId
        'actor.id',
        'actor.name',
        'actor.email',
        'actor.avatarUrl',
      ]);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      pageSize: limit,
    };
  }
}

export const boardActivityService = new BoardActivityService();
