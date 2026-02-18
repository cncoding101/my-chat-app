import { Global, Module } from '@nestjs/common';
import { ChatEventBus } from './event-bus.service';

@Global()
@Module({
  providers: [ChatEventBus],
  exports: [ChatEventBus],
})
export class CommonModule {}
