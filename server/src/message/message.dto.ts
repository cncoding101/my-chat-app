import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ minLength: 1 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  content!: string;
}

export class ChatCallbackDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  chatId!: string;

  @ApiProperty()
  @IsString()
  response!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsString()
  @IsOptional()
  error?: string | null;
}

export class MessageCallbackResponse {
  @ApiProperty()
  status!: string;

  @ApiProperty()
  messageId!: string;
}
