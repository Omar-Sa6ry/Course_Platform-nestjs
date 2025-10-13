import { EmailField, PasswordField } from '@bts-soft/core';
import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class LoginDto {
  @EmailField()
  email: string;

  @PasswordField()
  password: string;

  @Field()
  @IsString()
  fcmToken: string;
}
