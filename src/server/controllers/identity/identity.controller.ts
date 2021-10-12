import {
  controller,
  httpPost,
  httpPut,
  request,
  requestBody,
  requestParam,
  response
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { Request, Response } from 'express';
import { ActionNotAllowedError, BaseController } from '../base';
import { LoginDTO, SignupDTO, UpdateIdentityDTO } from './identity.dto';
import { login, signup, updateIdentity } from './identity.validator';
import { default as Validator } from '@app/server/middlewares/validator';
import { IIdentityRepository } from '@app/data/identity';
import { IOC_TYPES } from '@app/common/config/ioc-types';
import { LoginrateLimiterService } from '@app/server/services';
import { validateIdentity } from '@app/server/middlewares/validateIdentity';

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

  /**
   * Logs the user in using their phone number and password
   */
  @httpPost('/login', Validator(login))
  async login(
    @request() req: Request,
    @response() res: Response,
    @requestBody() body: LoginDTO
  ) {
    try {
      const identity = await this.identityRepo.byQuery(
        { email: body.email },
        '+password'
      );

      await LoginrateLimiterService.isUserLockedOut(identity.email);

      const isPasswordValid = await identity.isPasswordValid(body.password);

      if (!isPasswordValid) {
        await LoginrateLimiterService.limit(identity.email);
      }

      await LoginrateLimiterService.reset(identity.email);

      const updatedIdentity = await this.identityRepo.update(identity._id, {
        last_login: new Date()
      });

      const token = await this.identityRepo.generateToken(identity);

      this.handleSuccess(req, res, { updatedIdentity, token });
    } catch (err) {
      this.handleError(req, res, err);
    }
  }

  /**
   * Updates an identity's profile
   */
  @httpPut('/', validateIdentity, Validator(updateIdentity))
  async updateUser(
    @request() req: Request,
    @response() res: Response,
    @requestBody() body: UpdateIdentityDTO,
    @requestParam() id: string
  ) {
    try {
      const update = { ...body };

      if (req.user._id !== id) {
        throw new ActionNotAllowedError('Only personal details can be updated');
      }

      if (!Object.keys(update).length) {
        throw new ActionNotAllowedError('At least one field should be updated');
      }

      if (body.email) {
        update['email'] = await this.identityRepo.sanitiseAndValidateEmail(
          body.email
        );
      }

      const user = await this.identityRepo.update(req.user._id, update);

      this.handleSuccess(req, res, user);
    } catch (err) {
      this.handleError(req, res, err);
    }
  }
}
