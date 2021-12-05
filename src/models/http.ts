type SuccessFunction<In, Out> = (data: In) => Out
export type ErrorFunction<T> = (error: string, defaultOptions: T, options?: Partial<T>) => string | Error;
type WarnFunction<T> = (warn: string, defaultOptions: T, options?: Partial<T>,) => void;

export interface HttpServiceConfig<ErrorOptions, WarnOptions, In, Out> {
  apiUrl: string;
  defaultRequestConfig: RequestInit;
  earlyCatchStrategy: boolean
  connectionErrorCallback: ErrorFunction<ErrorOptions>;
  defaultErrorCallback: ErrorFunction<ErrorOptions>;
  defaultSuccessCallback: SuccessFunction<In, Out>
  defaultWarnCallback: WarnFunction<WarnOptions>;
  defaultErrorConfig: ErrorOptions
  defaultWarnConfig: WarnOptions
}

export interface ResponseConfig<ErrorOptions, WarnOptions, In, Out> {
  successCallback?: SuccessFunction<In, Out>
  errorCallback?: ErrorFunction<ErrorOptions>
  warnCallback?: WarnFunction<WarnOptions>
  errorConfig?: ErrorOptions
  warnConfig?: WarnOptions
}

export interface HttpBaseConfig<ErrorOptions, WarnOptions, In, Out> {
  url: string;
  requestConfig?: RequestInit;
  responseConfig?: ResponseConfig<ErrorOptions, WarnOptions, In, Out>;
}

export interface HttpQueryConfig<ErrorOptions, WarnOptions, In, Out>
    extends HttpBaseConfig<ErrorOptions, WarnOptions, In, Out> {
  queryObject?: {[key:string]: string | number}
}

export interface HttpCommandConfig<ErrorOptions, WarnOptions, In, Out>
    extends HttpBaseConfig<ErrorOptions, WarnOptions, In, Out> {
  body?: unknown;
}

export interface HttpConfig<ErrorOptions, WarnOptions, In, Out>
    extends HttpCommandConfig<ErrorOptions, WarnOptions, In, Out> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
}
