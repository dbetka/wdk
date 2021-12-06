export type SuccessFunction<In, Out> = (data: In) => Out
export type ErrorFunction<T> = (error: number, options: T) => number | Error;

export interface HttpServiceConfig<ErrorOptions> {
  apiUrl: string;
  defaultRequestConfig: RequestInit;
  connectionErrorCallback: ErrorFunction<ErrorOptions>;
  defaultErrorCallback: ErrorFunction<ErrorOptions>;
}

export interface HttpBaseConfig<In, Out, ErrorOptions> {
  url: string;
  errorOptions: ErrorOptions
  requestConfig?: RequestInit;
  successCallback?: SuccessFunction<In, Out>
}

export interface HttpQueryConfig<In, Out, ErrorOptions>
    extends HttpBaseConfig<In, Out, ErrorOptions> {
  queryObject?: {[key:string]: string | number}
}

export interface HttpCommandConfig<In, Out, ErrorOptions>
    extends HttpBaseConfig<In, Out, ErrorOptions> {
  body?: unknown;
}

export interface HttpConfig<In, Out, ErrorOptions>
    extends HttpCommandConfig<In, Out, ErrorOptions> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
}
