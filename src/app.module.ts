import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { AddressModule } from './address/address.module';
import { TrackingDetailModule } from './tracking-detail/tracking-detail.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { OrderItemModule } from './order-item/order-item.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { appConfig } from './config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import environmentValidation from './config/environment.validation';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';

// Define the env file path based on NODE_ENV, if it's set to development, use .env
const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    UserModule, 
    ProductModule, 
    CartModule, 
    OrderModule, 
    PaymentModule, 
    AddressModule, 
    TrackingDetailModule, 
    CartItemModule, 
    OrderItemModule, 
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENV? `.env.${ENV}` : '.env',
      load: [databaseConfig, appConfig],
      validationSchema: environmentValidation
    }),
    // TypeOrmModule.forRootAsync(databaseConfig.asProvider())
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        autoLoadEntities: true,
        synchronize: configService.get("database.synchronize"),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        database: configService.get('database.name'),
      })
    })

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ],
})
export class AppModule {}
