import { registerAs } from "@nestjs/config";

export default registerAs('database', () => ({

    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    synchronize: process.env.DB_SYNC === "true" ? true : false,
    name: process.env.DB_NAME,
    autoLoadEntities: process.env.DB_AUTOLOAD_ENTITIES === "true" ? true : false,
}))