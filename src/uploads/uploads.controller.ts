import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import express from 'express';
import { User } from 'src/user/entities/user.entity';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('file')
  public async uploadFile(
      @UploadedFile() file: Express.Multer.File,
      @Req() req:express.Request
  ){
      return this.uploadsService.uploadFile(file, req.user as User)
  }
}
