import { Test, TestingModule } from '@nestjs/testing';
import { CafesController } from './cafes.controller';
import { CafesService } from './cafes.service';

describe('CafesController', () => {
  let controller: CafesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CafesController],
      providers: [CafesService],
    }).compile();

    controller = module.get<CafesController>(CafesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
