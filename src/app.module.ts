import { Module } from '@nestjs/common';
import { AppConfigModule } from './configurations/config/config.module';
import { PrismaModule } from './configurations/db/prisma.module';
import { SecurityModule } from './security/security.module';
import { AppThrottlerModule } from './configurations/config/throttler.module';
import { CaslModule } from './casl/casl.module';
import { PostModule } from './resources/posts/post.module';

@Module({
  imports: [
    AppConfigModule,
    AppThrottlerModule,
    PrismaModule,
    SecurityModule,
    CaslModule,
    PostModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
