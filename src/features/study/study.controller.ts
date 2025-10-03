import { Controller } from '@nestjs/common';
import { StudyService } from './study.service';

@Controller('studies')
export class StudyController {
  constructor(private readonly studyService: StudyService) {}
}
