import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import { eUserProviderStrategy } from "src/user/enums/userProviderStrategy";
import { UserService } from "src/user/user.service";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google'){
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService
    ){
        super({
            clientID: configService.getOrThrow("GOOGLE_CLIENT_ID"),
            clientSecret: configService.getOrThrow("GOOGLE_CLIENT_SECRET"),
            callbackURL: 'http://localhost:3000/auth/google/redirect',
            scope: ['email', 'profile'],
        })
    }

    async validate(access_token: string, refresh_token: string, profile: Profile, done: VerifyCallback){
        try{
            const providerId = profile.id;
            const email = profile.emails?.[0]?.value;
            let name = profile.name?.familyName + ' ' + profile.name?.givenName

            let user = await this.userService.findByProviderId(providerId)
            if(!user && email){
                //Check if the user exists by email and password auth previously
                const existing = await this.userService.findOneOrNull(email)
                if(existing && !existing.providerId){
                    existing.provider = eUserProviderStrategy.GOOGLE;
                    existing.providerId = providerId;
                    user = await this.userService.createOAuthUser(existing)
                }
            }

            if(!user){
                user = await this.userService.createOAuthUser({
                    email,
                    provider: eUserProviderStrategy.GOOGLE,
                    providerId,
                    name
                })
            }
            // done(null, user)
            return user;
        }catch(err){
            done(err, false);
        }
    }
}