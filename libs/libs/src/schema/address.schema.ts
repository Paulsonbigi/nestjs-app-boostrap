import { Prop, Schema } from '@nestjs/mongoose';
import { CoordinateSchema } from './coordinate.schema';

export class AddressSchema extends CoordinateSchema {
  @Prop()
  address: string;
  @Prop()
  country: string;
  @Prop()
  city: string;
  @Prop()
  state: string;
}
