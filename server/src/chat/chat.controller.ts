import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiExcludeEndpoint } from '@nestjs/swagger';
import type { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatEventBus } from '../common/event-bus.service';
import { ChatResponse, ChatWithMessages, RemoveChatResponse } from './chat.dto';

const HEARTBEAT_INTERVAL = 30_000;

@Controller('chats')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatEventBus: ChatEventBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chat' })
  @ApiResponse({ status: 201, type: ChatResponse })
  async create() {
    return this.chatService.create();
  }

  @Get()
  @ApiOperation({ summary: 'Get all chats' })
  @ApiResponse({ status: 200, type: [ChatResponse] })
  async findAll() {
    return this.chatService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a chat by ID with messages' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: ChatWithMessages })
  async findById(@Param('id') id: string) {
    const chat = await this.chatService.findById(id);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return chat;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a chat by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: RemoveChatResponse })
  async remove(@Param('id') id: string) {
    return this.chatService.remove(id);
  }

  @Get(':id/events')
  @ApiExcludeEndpoint()
  async events(@Param('id') chatId: string, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    res.write(`: connected to chat ${chatId}\n\n`);

    const unsubscribe = this.chatEventBus.subscribe(chatId, (event) => {
      const data = JSON.stringify(event.data);
      res.write(`event: ${event.type}\ndata: ${data}\n\n`);
    });

    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat\n\n`);
      } catch {
        // Stream closed
      }
    }, HEARTBEAT_INTERVAL);

    res.on('close', () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  }
}
