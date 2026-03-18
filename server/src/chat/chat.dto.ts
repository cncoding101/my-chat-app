import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MessageResponse {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	content!: string;

	@ApiProperty({ enum: ['ASSISTANT', 'USER', 'TOOL'] })
	role!: string;

	@ApiPropertyOptional({ type: String })
	error?: string;
}

export class ChatResponse {
	@ApiProperty()
	id!: string;

	@ApiProperty({ type: String })
	title?: string;

	@ApiPropertyOptional({ type: [MessageResponse] })
	messages?: MessageResponse[];
}

export class ChatWithMessages {
	@ApiProperty()
	id!: string;

	@ApiProperty({ type: String })
	title?: string;

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
