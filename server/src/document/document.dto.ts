import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class DocumentResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  filename!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  chunkCount!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class IngestURLDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url!: string;
}

export class DocumentDeleteResponse {
  @ApiProperty()
  success!: boolean;
}
