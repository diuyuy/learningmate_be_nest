import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma-module/prisma.service';
import { QuizResponseDto } from './dto';

@Injectable()
export class QuizService {
  constructor(private readonly prismaService: PrismaService) {}

  async findManyByArticleId(articleId: bigint) {
    const quizzes = await this.prismaService.quiz.findMany({
      where: {
        articleId,
      },
    });

    return QuizResponseDto.fromList(quizzes);
  }
}
