import { PaginationDto } from '@app/libs/dto/pagination.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  ClientSession,
  SortOrder,
} from 'mongoose';

import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class BaseService<C extends Document, PType> {
  constructor(private readonly model: Model<C>) {}

  genereateUUID() {
    return uuidv4();
  }
  convertMilsecondsToHours(milliseconds: number) {
    /** this function only returns the hours ignoring minutes/seconds hence if value is not upto 60 minutes it will return zero */
    const millisecondsToMinutes = this.convertMilsecondsToMinutes(milliseconds);
    const hour = Math.floor(millisecondsToMinutes / 60);
    return hour;
  }
  convertMilsecondsToMinutes(milliseconds: number) {
    return Math.round(milliseconds / 60000);
  }
  isoDateFormatter(date: Date) {
    date.setHours(0, 0, 0);
    date.setUTCMilliseconds(0);
    return date.toISOString();
  }

  dateFormatter(date: Date) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      weekday: 'short',
      year: 'numeric',
    });
  }
  currencyFormatter() {
    return Intl.NumberFormat('en-US');
  }
  toTitleCase(str: string) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
  }
  paginatedResult = async (
    query: PaginationDto,
    filter: FilterQuery<C>,
    sort?: {
      [key: string]: SortOrder;
    } /** sort by id in descending order by default */,
    population?: any,
  ) => {
    const { limit, page } = query;
    const foundItems = await this.model
      .find(filter)
      .skip((page - 1) * limit)
      .sort(
        sort ?? { createdAt: -1 },
      ) /** use sort configuration or always sort by created date in descending order */
      .limit(limit + 1) /** adding one to tell if there is a next record */
      .populate(population);

    const nextPage = foundItems.length > limit ? page + 1 : null;

    return {
      limit,
      nextPage,
      currentPage: page,
      foundItems,
    };
  };

  async getSessions() {
    return this.model.startSession();
  }

  async findByIdAndUpdateWithSession(
    id: string,
    data: UpdateQuery<C>,
    session: ClientSession,
  ) {
    try {
      const result = await this.model.findByIdAndUpdate(id, data, {
        new: true,
        session,
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async distinct(filter: FilterQuery<C>, field: keyof C) {
    return await this.model.distinct(field as unknown as string, filter);
  }

  async countDocuments(filter?: FilterQuery<C>) {
    return this.model.countDocuments(filter);
  }
  async insertManyWithSession(orders: C[], session: ClientSession) {
    return await this.model.insertMany(orders, {
      session,
    });
  }
  async insertMany(orders: C[]) {
    return await this.model.insertMany(orders, {});
  }
  async findOneAndUpdateOrErrorOut(
    filter: FilterQuery<C>,
    data: UpdateQuery<C>,
    population?: any,
  ) {
    try {
      const result = await this.model
        .findOneAndUpdate(filter, data, {
          new: true,
        })
        .populate(population);
      if (!result)
        throw new BadRequestException(`${this.model.modelName} not found`);

      return result;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findOneAndUpdateWithSession(
    filter: FilterQuery<C>,
    data: UpdateQuery<C>,
    session: ClientSession,
  ) {
    try {
      const result = await this.model.findOneAndUpdate(filter, data, {
        new: true,
        session,
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
  async updateManyWithSession(
    filter: FilterQuery<C>,
    data: UpdateQuery<C>,
    session: ClientSession,
  ) {
    try {
      const result = await this.model.updateMany(filter, data, {
        session,
        new: true,
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  deleteById(id: string) {
    return this.model.findByIdAndDelete(id);
  }

  async deleteMany(filter: FilterQuery<C>) {
    const deletedRecrods = await this.model.deleteMany(filter);
    if (!deletedRecrods)
      throw new NotFoundException(
        `error deleting ${this.model.modelName} records`,
      );
    return deletedRecrods;
  }
  async findById(id: string, population?: any, select?: Array<keyof C>) {
    return this.model
      .findById(id)
      .populate(population)
      .select(select as string[]);
  }
  async findByIdOrErrorOut(id: string, population?: any) {
    const found = await this.model.findById(id).populate(population);
    if (!found)
      throw new NotFoundException(`${this.model.modelName} not found `);
    return found;
  }
  async findByIdAndUpdate(id: string, data: UpdateQuery<C>, population?: any) {
    try {
      const foundRecord = await this.model
        .findByIdAndUpdate(id, data, {
          new: true,
        })
        .populate(population);
      return foundRecord;
    } catch (e) {
      // TODO: do something here
    }
  }
  async updateMany(
    filter: FilterQuery<C>,
    data: UpdateQuery<C>,
    population?: any,
  ) {
    try {
      const foundRecord = await this.model
        .updateMany(filter, data, {
          new: true,
        })
        .populate(population);
      return foundRecord;
    } catch (e) {
      // TODO: do something here
    }
  }

  async updateManyOrErrorOut(
    filter: FilterQuery<C>,
    data: UpdateQuery<C>,
    population?: any,
  ) {
    try {
      const response = await this.model
        .updateMany(filter, data, {
          new: true,
        })
        .populate(population);
      if (!response)
        throw new BadRequestException(
          `error updating ${this.model.modelName} `,
        );
      return response;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
  async updateByIdErrorOut(id: string, data: UpdateQuery<C>, population?: any) {
    try {
      const foundRecord = await this.model
        .findByIdAndUpdate(id, data, {
          new: true,
        })
        .populate(population);
      if (!foundRecord)
        throw new NotFoundException(
          `${this.model.modelName}  record not found`,
        );
      return foundRecord;
    } catch (e) {
      // TODO: do something here
    }
  }
  findOne(
    data: FilterQuery<C>,
    populate?: any,
    sort?: {
      [key: string]: SortOrder;
    },
  ) {
    return this.model
      .findOne(data)
      .populate(populate)
      .sort(sort ?? { createdAt: -1 });
  }
  find(
    data: FilterQuery<C>,
    populate?: any,
    sort?: {
      [key: string]: SortOrder;
    },
  ) {
    return this.model
      .find(data)
      .populate(populate)
      .sort(sort ?? { createdAt: -1 });
  }
  async findOrErrorOut(data: FilterQuery<C>, populate?: any) {
    const results = await this.model.find(data).populate(populate);
    if (!results.length)
      throw new NotFoundException(`${this.model.modelName} records not found`);
    return results;
  }
  async findOneOrErrorOut(data: FilterQuery<C>, populate?: any) {
    const foundRecord = await this.findOne(data).populate(populate);
    if (!foundRecord)
      throw new NotFoundException(`${this.model.modelName} record not found `);
    return foundRecord;
  }
  async propExists(data: FilterQuery<C>) {
    return this.model.countDocuments(data).then((count) => count > 0);
  }
}
