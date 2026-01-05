import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Upload } from './entities/upload.entity';
import { Repository } from 'typeorm';
import { fileTypesEnum } from './enums/filetypes.enum';
import { IUploadFileToDbInterface } from './interfaces/uploadFileToDb.interface';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadsRepository: Repository<Upload>,
  ){}
  
  public async uploadFile(file: Express.Multer.File, user: User | undefined){
    const url = `http://localhost:3000/uploads/${file.filename}`;

    try{
      const uploadfile: IUploadFileToDbInterface = {
        name: file.filename,
        path: url,
        type: fileTypesEnum.IMAGE,
        mime: file.mimetype,
        size: file.size,
        originalName: file.originalname,
        owner: user
      }
       const upload = this.uploadsRepository.create(uploadfile)
      const result = await this.uploadsRepository.save(upload)
      console.log(result)
      return {
        data: result,
        status: true
      }
    }catch(error){
      throw new ConflictException(error)
    }
  }
}
