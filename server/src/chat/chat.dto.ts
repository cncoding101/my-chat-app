import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MessageResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  content!: string;

  @ApiProperty({ enum: ['ASSISTANT', 'USER', 'TOOL'] })
  role!: string;
}

export class ChatResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true, type: String })
  title!: string | null;

  @ApiPropertyOptional({ type: [MessageResponse] })
  messages?: MessageResponse[];
}

export class ChatWithMessages {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true, type: String })
  title!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: [MessageResponse] })
  messages!: MessageResponse[];
}

export class RemoveChatResponse {
  @ApiProperty()
  success!: boolean;
}
