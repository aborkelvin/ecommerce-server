// src/tracking-update/entities/tracking-update.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { Order } from 'src/order/entities/order.entity';
import { eTrackingStatus } from '../enums/trackingStatus.enum';

@Entity()
export class TrackingDetail {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({
        type: 'enum',
        enum: eTrackingStatus,
        nullable: false,
        default: eTrackingStatus.PROCESSING
    })
    status: eTrackingStatus; 

    @Column({
        nullable: true, 
        type: "varchar"
    })
    message?: string; 

    @Column({
        nullable: true, 
        type: "varchar"
    })
    location?: string;

    @CreateDateColumn()
    createDate: Date;
    
    @UpdateDateColumn()
    updateDate: Date;


    @ManyToOne(() => Order, (order) => order.trackingDetails)
    order: Order;

    @Column({
        nullable: true,
        type: "varchar"
    })
    trackingNumber?: string; 

    @Column({
        nullable: true,
        type: "varchar"
    })
    carrierName?: string; 
}
