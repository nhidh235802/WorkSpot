import { Test, TestingModule } from '@nestjs/testing';
import { CafesService } from './cafes.service';

describe('CafesService', () => {
  let service: CafesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CafesService],
    }).compile();

    service = module.get<CafesService>(CafesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
