// /* eslint-disable @typescript-eslint/unbound-method */
// import { Test, TestingModule } from '@nestjs/testing';
// import { ArticleService } from '../article/article.service';
// import { KeywordController } from './keyword.controller';
// import { KeywordService } from './keyword.service';

// jest.mock('../article/article.service', () => ({
//   ArticleService: jest.fn().mockImplementation(() => ({
//     findArticlePreviewByKeyword: jest.fn(),
//   })),
// }));

// jest.mock('src/common/pipes/parse-bigint-pipe', () => ({
//   ParseBigIntPipe: jest.fn(),
// }));

// describe('KeywordController', () => {
//   let controller: KeywordController;
//   let keywordService: KeywordService;
//   let articleService: ArticleService;

//   const mockKeywordService = {
//     remove: jest.fn(),
//   };

//   const mockArticleService = {
//     findArticlePreviewByKeyword: jest.fn(),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [KeywordController],
//       providers: [
//         {
//           provide: KeywordService,
//           useValue: mockKeywordService,
//         },
//         {
//           provide: ArticleService,
//           useValue: mockArticleService,
//         },
//       ],
//     }).compile();

//     controller = module.get<KeywordController>(KeywordController);
//     keywordService = module.get<KeywordService>(KeywordService);
//     articleService = module.get<ArticleService>(ArticleService);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   describe('findArticleByKeyword', () => {
//     it('should call articleService.findArticlePreviewByKeyword with correct parameters', async () => {
//       const keywordId = BigInt(1);
//       const expectedResult = { articles: [] };
//       mockArticleService.findArticlePreviewByKeyword.mockResolvedValue(
//         expectedResult,
//       );

//       const result = await controller.findArticleByKeyword(keywordId);

//       expect(articleService.findArticlePreviewByKeyword).toHaveBeenCalledWith(
//         keywordId,
//       );
//       expect(result).toBe(expectedResult);
//     });
//   });

//   describe('remove', () => {
//     it('should call keywordService.remove with correct parameters', () => {
//       const id = '1';
//       const expectedResult = { success: true };
//       mockKeywordService.remove.mockReturnValue(expectedResult);

//       const result = controller.remove(id);

//       expect(keywordService.remove).toHaveBeenCalledWith(1);
//       expect(result).toBe(expectedResult);
//     });
//   });
// });
