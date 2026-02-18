import { Controller, Post, Param, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateMessageDto, ChatCallbackDto, MessageCallbackResponse } from './message.dto';
import { MessageResponse } from '../chat/chat.dto';

@Controller('chats/:chatId/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message in a chat' })
  @ApiParam({ name: 'chatId', type: String })
  @ApiResponse({ status: 201, type: MessageResponse })
  async create(
    @Param('chatId') chatId: string,
    @Body() body: CreateMessageDto,
  ) {
    return this.messageService.create(chatId, body);
  }

  @Post(':messageId/callback')
  @ApiOperation({ summary: 'Worker callback for assistant response' })
  @ApiParam({ name: 'chatId', type: String })
  @ApiParam({ name: 'messageId', type: String })
  @ApiResponse({ status: 200, type: MessageCallbackResponse })
  async callback(
    @Param('chatId') chatId: string,
    @Param('messageId') _messageId: string,
    @Body() body: ChatCallbackDto,
  ) {
    return this.messageService.handleCallback(chatId, body);
  }
}
