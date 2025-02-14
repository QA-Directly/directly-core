import { Test, TestingModule } from '@nestjs/testing';
import { ServiceApplicationService } from './service-application.service';

describe('ServiceApplicationService', () => {
  let service: ServiceApplicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceApplicationService],
    }).compile();

    service = module.get<ServiceApplicationService>(ServiceApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
