import { Injectable } from '@nestjs/common';
import { genSalt } from 'bcrypt';
import * as bcrypt from 'bcrypt'

@Injectable()
export class Bcrypt {

    async hashUserPassword(password:string){
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password, salt)
        return hashedPassword;
    }

    async verifyPassword(password:string, hashedPassword: string){
        const isMatch = bcrypt.compare(password, hashedPassword)
        return isMatch;
    }
}
