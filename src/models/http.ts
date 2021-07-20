import { ErrorsDictionary } from './errors';

type SuccessFunction = <T>(data: unknown) => T;
type ErrorFunction = (error: string, defaultError: string, errors: ErrorsDictionary) => unknown;

export interface HttpServiceConfig {
  apiUrl: string;
  connectionErrorCallback: (error: string) => void;
  defaultErrorCallback: ErrorFunction;
  defaultSuccessCallback: SuccessFunction;
  defaultRequestConfig: RequestInit;
}

export interface HttpBaseConfig {
  url: string;
  requestConfig?: RequestInit;
  responseConfig: ResponseConfig;
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
  successCallback?: SuccessFunction
  errorCallback?: ErrorFunction
  defaultError: string
  errors: ErrorsDictionary
}
