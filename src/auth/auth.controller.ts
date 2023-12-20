import { Controller, Get, HttpStatus, Logger, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('login')
  public async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = req.headers['authorization']?.split(' ')[1];
    try {
      // 1. verify the access token & get the user info from our database (sp synchronize the data from AT to our DB)
      // 3. create the session token with firebas
      // 4. set the session token as httpOnly cookie
      // 5. return the user info
      const { decodedToken, userInfo } =
        await this.authService.verifyAndUpserUpsert(accessToken);
      console.log(decodedToken);
      return {
        status: HttpStatus.OK,
        body: {
          email: userInfo.email,
          image: userInfo.img,
          name: userInfo.name,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          status: HttpStatus.UNAUTHORIZED,
          body: {
            message: 'You are not authorized to access this resource',
          },
        };
      }
      this.logger.error(error);
      return {
        status: 500,
        body: {
          message: error.message,
        },
      };
    }
    return {
      status: 200,
      body: {
        email: 'email',
        image: '',
        name: '',
      },
    };
  }
}
