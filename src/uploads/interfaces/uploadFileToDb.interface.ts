import { User } from "src/user/entities/user.entity";
import { fileTypesEnum } from "../enums/filetypes.enum";

export interface IUploadFileToDbInterface{
    name:string;
    path: string;
    mime: string;
    type: fileTypesEnum;
    size: number;
    originalName: string
    owner?:User;
}