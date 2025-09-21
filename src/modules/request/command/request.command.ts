import { SendEmailService } from 'src/common/queues/email/sendemail.service';

export class RequestCommand implements IEmailCommand {
  constructor(
    private readonly emailService: SendEmailService,
    private readonly email: string,
    private readonly title: string,
    private readonly description: string,
  ) {}

  async execute(): Promise<void> {
    await this.emailService.sendEmail(this.email, this.title, this.description);
  }
}
