import * as Joi from 'joi';
import { BaseEnvConfig } from '../enum/env.enum';
// NOTE: THIS ARE STANDARD CONFIGS FOR THE UTILS LIBRARY
export const baseEnvValidator = Joi.object().keys({
  [BaseEnvConfig.PORT]: Joi.string().trim().required(),
  [BaseEnvConfig.TOKEN_EXPIRATION_TIME]: Joi.string().trim().required(),
  [BaseEnvConfig.TOKEN_SECRET]: Joi.string().trim().required(),
  [BaseEnvConfig.CONNECTION_STRING]: Joi.string().trim().required(),
});
