import { Prop } from '@nestjs/mongoose';

export class CoordinateSchema {
  @Prop({ type: String })
  type: string;
  @Prop({ type: [Number] })
  coordinates: [number, number];
}
