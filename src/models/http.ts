import { ErrorsDictionary } from './errors';

type SuccessFunction = <T>(data: any) => T;
type ErrorFunction = (error: string, defaultError: string, errors: ErrorsDictionary) => void;
type WarnFunction = (warn: string, defaultWarn: string, warns: ErrorsDictionary) => void;

export interface HttpServiceConfig {
  apiUrl: string;
  defaultRequestConfig: RequestInit;
  connectionErrorCallback: ErrorFunction;
  defaultErrorCallback: ErrorFunction;
  defaultSuccessCallback: SuccessFunction;
  defaultWarnCallback: WarnFunction;
  defaultError: string
  defaultWarn: string
  defaultErrors: ErrorsDictionary
  defaultWarns: ErrorsDictionary
}

export interface HttpBaseConfig {
  url: string;
  requestConfig?: RequestInit;
  responseConfig?: ResponseConfig;
}

export interface HttpQueryConfig extends HttpBaseConfig {
  queryParamsObject?: Object;
}

export interface HttpCommandConfig extends HttpBaseConfig {
  body?: unknown;
}

export interface HttpConfig extends HttpCommandConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
}

export interface ResponseConfig {
  defaultWarn?: string,
  defaultError?: string,
  warns?: ErrorsDictionary
  errors?: ErrorsDictionary
  successCallback?: SuccessFunction
  errorCallback?: ErrorFunction
  warnCallback?: WarnFunction
}
