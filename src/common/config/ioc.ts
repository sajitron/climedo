import 'module-alias/register';

import { Container } from 'inversify';

// import controllers
import '../../server/controllers';
import { IOC_TYPES } from './ioc-types';

import { IIdentityRepository, IdentityRepository } from '@app/data/identity';

const container = new Container();

container
  .bind<IIdentityRepository>(IOC_TYPES.IdentityRepository)
  .to(IdentityRepository);

export default container;
