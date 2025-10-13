import { SendEmailService } from '@bts-soft/core';

export class SendCertificateEmailCommand implements IEmailCommand {
  constructor(
    private readonly emailService: SendEmailService,
    private readonly email: string,
    private readonly fullname: string,
    private readonly title: string,
  ) {}

  async execute(): Promise<void> {
    await this.emailService.sendEmail(
      this.email,
      'Certifiate',
      `concreate ${this.fullname}, certificate on course ${this.title}`,
    );
  }
}
