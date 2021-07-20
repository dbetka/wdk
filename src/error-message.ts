import { Communicates } from './models/communicates';
import { ErrorMessageConfig } from './models/errors';

export class ErrorMessage extends Error {
  public humanMessage = '';
  private readonly hard: boolean = false;
  private communicates: Communicates;
  private static config: ErrorMessageConfig;

  constructor(
    message: string,
    config?: ErrorMessageConfig,
  ) {
    super(message);
    if (config) {
      ErrorMessage.config = config;
    }
    if(!config && !ErrorMessage.config) {
      // tslint:disable-next-line:no-console
      console.warn('Please provide config for ErrorMessage class')
    }
    this.hard = ErrorMessage.config.hard;
    this.communicates = ErrorMessage.config.communicates;
  }

  showMessage(humanMessage = this.message): void {
    this.humanMessage = humanMessage;
    this.communicates.showError(humanMessage);
  }

  showMessageTemporary(humanMessage = this.message): void {
    this.humanMessage = humanMessage;
    if (this.hard) this.communicates.showError(humanMessage);
    else this.communicates.showErrorTemporary(humanMessage);
  }
}
