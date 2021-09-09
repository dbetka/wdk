type SuccessFunction = <T>(data: any) => T;
export type ErrorFunction<T> = (error: string, defaultOptions: T, options?: Partial<T>) => string | Error;
type WarnFunction<T> = (warn: string,  defaultOptions: T, options?: Partial<T>,) => void;


export interface HttpServiceConfig<ErrorOptions, WarnOptions> {
  apiUrl: string;
  defaultRequestConfig: RequestInit;
  earlyCatchStrategy: boolean
  connectionErrorCallback: ErrorFunction<ErrorOptions>;
  defaultErrorCallback: ErrorFunction<ErrorOptions>;
  defaultSuccessCallback: SuccessFunction;
  defaultWarnCallback: WarnFunction<WarnOptions>;
  defaultErrorConfig: ErrorOptions
  defaultWarnConfig: WarnOptions
}

export interface HttpBaseConfig<ErrorOptions, WarnOptions> {
  url: string;
  requestConfig?: RequestInit;
  responseConfig?: ResponseConfig<ErrorOptions, WarnOptions>;
}

export interface HttpQueryConfig<ErrorOptions, WarnOptions>
    extends HttpBaseConfig<ErrorOptions, WarnOptions> {
  queryObject?: Object;
}

export interface HttpCommandConfig<ErrorOptions, WarnOptions>
    extends HttpBaseConfig<ErrorOptions, WarnOptions> {
  body?: unknown;
}

export interface HttpConfig<ErrorOptions, WarnOptions>
    extends HttpCommandConfig<ErrorOptions, WarnOptions> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
}

export interface ResponseConfig<ErrorOptions, WarnOptions> {
  successCallback?: SuccessFunction
  errorCallback?: ErrorFunction<ErrorOptions>
  warnCallback?: WarnFunction<WarnOptions>
  errorConfig?: ErrorOptions
  warnConfig?: WarnOptions
}
