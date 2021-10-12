import {
  controller,
  httpPost,
  request,
  requestBody,
  response
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { Request, Response } from 'express';
import { BaseController } from '../base';
import { SignupDTO } from './identity.dto';
import { signup } from './identity.validator';
import { default as Validator } from '@app/server/middlewares/validator';
import { IIdentityRepository } from '@app/data/identity';
import { IOC_TYPES } from '@app/common/config/ioc-types';

@controller('/identity')
export default class IdentityController extends BaseController {
  @inject(IOC_TYPES.IdentityRepository)
  identityRepo: IIdentityRepository;
  /**
   * Creates an identity
   */
  @httpPost('/', Validator(signup))
  async signup(
    @request() req: Request,
    @response() res: Response,
    @requestBody() body: SignupDTO
  ) {
    try {
      // sanitise gmail addresses & check if already in use
      body.email = await this.identityRepo.sanitiseAndValidateEmail(body.email);

      const identity = await this.identityRepo.createAccount(body);

      const token = this.identityRepo.generateToken(identity);

      const data = { identity, token };

      this.handleSuccess(req, res, data);
    } catch (err) {
      this.handleError(req, res, err);
    }
  }
}
