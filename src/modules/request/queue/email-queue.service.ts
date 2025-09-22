import { Injectable } from '@nestjs/common';
import { SendEmailService } from 'src/common/queues/email/sendemail.service';
import { UserFacadeService } from 'src/modules/users/fascade/user.fascade';

@Injectable()
export class EmailQueueService {
  constructor(
    private readonly emailService: SendEmailService,
    private readonly userFascade: UserFacadeService,
  ) {}

  async queueCourseActivationEmails(
    users: any[],
    title: string,
    description: string,
    i18n: any,
  ): Promise<void> {
    const emailJobs = users.map((user) =>
      this.createEmailJob(user, title, description, i18n),
    );

    await Promise.all(emailJobs);
  }

  private async createEmailJob(
    user: any,
    title: string,
    description: string,
    i18n: any,
  ): Promise<void> {
    try {
      if (user && user.id) await this.userFascade.activeUser(user.id);

      const subject = i18n.t('request.COURSE_IS_ACTIVE', { args: { title } });
      const text = i18n.t('request.COURSE_IS_ACTIVE', {
        args: { description },
      });

      await this.emailService.queueEmail(user.email, subject, text);
    } catch (error) {
      console.error(`Failed to queue email for user ${user?.id}:`, error);
    }
  }
}
