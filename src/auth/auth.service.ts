import { Inject, Injectable, Logger } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { User } from 'src/user/model/user.dto';
import { FirebaseAdminService } from './firebase-admin.service';
import { prisma } from 'src/prisma.module';
@Injectable()
export class AuthService {
  @Inject(FirebaseAdminService)
  private readonly firebaseAdminService: FirebaseAdminService;

  private readonly logger = new Logger(AuthService.name);

  constructor() {}

  public async verifyAndUpserUpsert(accessToken: string): Promise<{
    decodedToken: DecodedIdToken;
    userInfo: User;
  }> {
    const decodedToken = await this.firebaseAdminService.firebaseAdmin
      .auth()
      .verifyIdToken(accessToken);
    const userInfo = await prisma.user.upsert({
      where: {
        email: decodedToken.email,
      },
      update: {
        name: decodedToken.name,
        img: decodedToken.picture,
      },
      create: {
        email: decodedToken.email,
        name: decodedToken.name,
        img: decodedToken.picture,
      },
      select: {
        email: true,
        name: true,
        img: true,
        id: true,
      },
    });

    // this part is for adding the custom claims to the user for example roles, auths etc.
    await this.firebaseAdminService.firebaseAdmin
      .auth()
      .setCustomUserClaims(decodedToken.uid, {
        dbUserId: userInfo.id,
      });
    return { decodedToken, userInfo };
  }
}
