import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { fileTypesEnum } from "../enums/filetypes.enum";
import { User } from "src/user/entities/user.entity";

@Entity()
export class Upload{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        length: 1024,
        nullable: false
    })
    name: string;

    @Column({
        type: "varchar",
        length: 1024,
        nullable: false
    })
    originalName: string;

    @Column({
        type: "varchar",
        length: 1024,
        nullable: false
    })
    path: string;

    @Column({
        type: "enum",
        enum: fileTypesEnum,
        default: fileTypesEnum.IMAGE,
        nullable: false
    })
    type: string;

    @Column({
        type: "varchar",
        length: 128,
        nullable: false
    })
    mime: string;

    @Column({
        type: "varchar",
        length: 1024,
        nullable: false
    })
    size:number;

    @ManyToOne(() => User, (user) => user.uploads, { eager: false })
    owner: User;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
}