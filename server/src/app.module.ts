import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { DocumentModule } from './document/document.module';
import { MessageModule } from './message/message.module';
import { PrismaModule } from './prisma/prisma.module';
import { WorkerModule } from './worker/worker.module';

@Module({
  imports: [PrismaModule, ChatModule, MessageModule, WorkerModule, DocumentModule],
})
export class AppModule {}
