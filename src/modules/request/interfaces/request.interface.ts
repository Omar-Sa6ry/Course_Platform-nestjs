import { I18nService } from 'nestjs-i18n';
import { Request } from '../entity/request.entity';

export interface IRequestHandler {
  setNext(handler: IRequestHandler): IRequestHandler;
  handle(request: Request | null, i18n: I18nService): Promise<void>;
}
