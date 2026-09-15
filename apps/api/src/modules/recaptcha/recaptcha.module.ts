import { Module } from '@nestjs/common';
import { RecaptchaController } from './recaptcha.controller';
import { RecaptchaService } from './recaptcha.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RecaptchaController],
  providers: [RecaptchaService],
  exports: [RecaptchaService],
})
export class RecaptchaModule {}
