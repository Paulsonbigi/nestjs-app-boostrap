import { Prop } from '@nestjs/mongoose';
import { CountryCodeEnum } from '../enum/countryCodes.enum';

export class PhoneNumberSchema {
  @Prop({ type: String, enum: Object.values(CountryCodeEnum) })
  code: CountryCodeEnum;
  @Prop()
  number: string;
  @Prop()
  local: string;
}
