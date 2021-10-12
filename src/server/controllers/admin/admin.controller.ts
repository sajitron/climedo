import {
  controller,
  httpPut,
  request,
  requestBody,
  requestParam,
  response
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { Request, Response } from 'express';
import { ActionNotAllowedError, BaseController } from '../base';
import { UpdateIdentityDTO } from './admin.dto';
import { updateIdentity } from './admin.validator';
import { default as Validator } from '@app/server/middlewares/validator';
import { IIdentityRepository } from '@app/data/identity';
import { IOC_TYPES } from '@app/common/config/ioc-types';
import {
  validateAdmin,
  validateIdentity
} from '@app/server/middlewares/validateIdentity';

@controller('/admin', validateIdentity, validateAdmin)
export default class IdentityController extends BaseController {
  @inject(IOC_TYPES.IdentityRepository)
  identityRepo: IIdentityRepository;

  /**
   * Updates an identity's profile
   */
  @httpPut('/:id', Validator(updateIdentity))
  async updateUser(
    @request() req: Request,
    @response() res: Response,
    @requestBody() body: UpdateIdentityDTO,
    @requestParam() id: string
  ) {
    try {
      const update = { ...body };

      if (!Object.keys(update).length) {
        throw new ActionNotAllowedError('At least one field should be updated');
      }

      if (body.email) {
        update['email'] = await this.identityRepo.sanitiseAndValidateEmail(
          body.email
        );
      }

      const user = await this.identityRepo.update(id, update);

      this.handleSuccess(req, res, user);
    } catch (err) {
      this.handleError(req, res, err);
    }
  }
}
