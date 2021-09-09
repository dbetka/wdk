import { checkIfStringIsReadable} from './random';

export class ValidateTools {
  static hasNumber (data: string): boolean {
    return /\d/.test(data);
  }
  static hasNotNumber (data: string): boolean {
    return !this.hasNumber(data);
  }

  static isEmail (email: string): boolean {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  static isNotEmail (email: string): boolean {
    return !this.isEmail(email);
  }

  static isLonger (data: ArrayLike<unknown>, length: number): boolean {
    return data.length > length;
  }

  static isShorter (data: ArrayLike<unknown>, length: number): boolean {
    return (data && data.length) ? data.length < length : true;
  }

  static isNullOrEmpty (data: any): boolean {
    return ['', undefined, null].includes(data);
  }

  static isEasyToRead (data: string): boolean {
    return checkIfStringIsReadable(data);
  }

  static isUndefined (data: any): boolean {
    return data === undefined;
  }

  static inRange (value: number, start: number, end: number): boolean {
    return value >= start && value <= end;
  }

  static inNotRange (value: number, start: number, end: number): boolean {
    return !this.inRange(value, start, end);
  }

  static contain<T> (value: T, array: T[]): boolean {
    return array.includes(value);
  }

  static notContain<T> (value: T, array: T[]): boolean {
    return !this.contain(value, array);
  }

  static isBoolean (value: unknown): boolean {
    return typeof value === 'boolean';
  }

  static isNotBoolean (value: unknown): boolean {
    return !this.isBoolean(value);
  }
}

