import { UserObjectType, CreateUserType, SessionType } from '@accounts/common';
import { EmailTemplatesType, EmailTemplateType } from './email';
import { AccountsServer } from './accounts-server';

export interface AuthService {
  db: DBInterface;
  server: AccountsServer;
  serviceName: string;
  authenticate(params: any): Promise<UserObjectType | null>;
}

export type UserObjectSanitizerFunction = (
  userObject: UserObjectType,
  omitFunction: (userDoc: object) => UserObjectType,
  pickFunction: (userDoc: object) => UserObjectType
) => any;

export type ResumeSessionValidator = (
  user: UserObjectType,
  session: SessionType
) => Promise<any>;

export type PrepareMailFunction = (
  to: string,
  token: string,
  user: UserObjectType,
  pathFragment: string,
  emailTemplate: EmailTemplateType,
  from: string
) => object;

export type EmailType = EmailTemplateType & { to: string };

export type SendMailFunction = (
  emailConfig: EmailType | object
) => Promise<object>;

export interface AccountsServerOptions {
  db: DBInterface;
  tokenSecret: string;
  tokenConfigs?: {
    accessToken?: {
      expiresIn?: string;
    };
    refreshToken?: {
      expiresIn?: string;
    };
  };
  emailTokensExpiry?: number;
  emailTemplates?: EmailTemplatesType;
  userObjectSanitizer?: UserObjectSanitizerFunction;
  impersonationAuthorize?: (
    user: UserObjectType,
    impersonateToUser: UserObjectType
  ) => Promise<any>;
  resumeSessionValidator?: ResumeSessionValidator;
  siteUrl?: string;
  prepareMail?: PrepareMailFunction;
  sendMail?: SendMailFunction;
  // https://github.com/eleith/emailjs#emailserverconnectoptions
  email?: object;
}

export interface ConnectionInformationsType {
  ip?: string;
  userAgent?: string;
}

export interface DBInterface {
  // Find user by identity fields
  findUserByEmail(email: string): Promise<UserObjectType | null>;
  findUserByUsername(username: string): Promise<UserObjectType | null>;
  findUserById(userId: string): Promise<UserObjectType | null>;

  // Create and update users
  createUser(user: CreateUserType): Promise<string>;
  setUsername(userId: string, newUsername: string): Promise<void>;
  setProfile(userId: string, profile: object): Promise<object>;

  // Auth services related operations
  findUserByServiceId(
    serviceName: string,
    serviceId: string
  ): Promise<UserObjectType | null>;
  setService(userId: string, serviceName: string, data: object): Promise<void>;

  // Password related operation
  findPasswordHash(userId: string): Promise<string>;
  findUserByResetPasswordToken(token: string): Promise<UserObjectType | null>;
  setPassword(userId: string, newPassword: string): Promise<void>;
  addResetPasswordToken(
    userId: string,
    email: string,
    token: string,
    reason?: string
  ): Promise<void>;
  setResetPassword(
    userId: string,
    email: string,
    newPassword: string,
    token: string
  ): Promise<void>;

  // Email related operations
  findUserByEmailVerificationToken(
    token: string
  ): Promise<UserObjectType | null>;
  addEmail(userId: string, newEmail: string, verified: boolean): Promise<void>;
  removeEmail(userId: string, email: string): Promise<void>;
  verifyEmail(userId: string, email: string): Promise<void>;
  addEmailVerificationToken(
    userId: string,
    email: string,
    token: string
  ): Promise<void>;

  // Session related operations
  findSessionById(sessionId: string): Promise<SessionType>;
  createSession(
    userId: string,
    ip?: string,
    userAgent?: string,
    extraData?: object
  ): Promise<string>;
  updateSession(
    sessionId: string,
    ip?: string,
    userAgent?: string
  ): Promise<void>;
  invalidateSession(sessionId: string): Promise<void>;
  invalidateAllSessions(userId: string): Promise<void>;
}
