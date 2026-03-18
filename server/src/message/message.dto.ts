import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import type { ChatCallbackPayload } from '../worker/clients/worker.client';

export class CreateMessageDto {
	@ApiProperty({ minLength: 1 })
	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	content!: string;
}

export class ChatCallbackDto implements ChatCallbackPayload {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	chatId!: string;

	@ApiProperty()
	@IsString()
	content!: string;

	@ApiProperty({ required: false })
	@IsString()
	@IsOptional()
	status?: string;

	@ApiProperty({ required: false, type: String })
	@IsString()
	@IsOptional()
	error?: string;
}

export class MessageCallbackResponse {
	@ApiProperty()
	status!: string;

	@ApiProperty()
	messageId!: string;
}
