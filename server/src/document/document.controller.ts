import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { DocumentService } from './document.service';
import {
  DocumentResponse,
  DocumentDeleteResponse,
  IngestURLDto,
} from './document.dto';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and ingest a document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, type: DocumentResponse })
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.documentService.ingestFile(file);
  }

  @Post('url')
  @ApiOperation({ summary: 'Ingest a document from a URL' })
  @ApiResponse({ status: 201, type: DocumentResponse })
  async ingestURL(@Body() body: IngestURLDto) {
    return this.documentService.ingestURL(body.url);
  }

  @Get()
  @ApiOperation({ summary: 'List all ingested documents' })
  @ApiResponse({ status: 200, type: [DocumentResponse] })
  async findAll() {
    return this.documentService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an ingested document' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: DocumentDeleteResponse })
  async remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}
