export type SuccessFunction<In, Out> = (data: In) => Out;
export type ErrorFunction<ErrorOptions, ServerError> = (error: ServerError, options: ErrorOptions) => number | Error | void | string;

export interface HttpServiceConfig<ErrorOptions, ServerError> {
  fetchProxy?(url:string, options:RequestInit): Promise<Response>;
  apiUrl: string;
  defaultRequestConfig: RequestInit;
  connectionErrorCallback: ErrorFunction<ErrorOptions, ServerError>;
  defaultErrorCallback: ErrorFunction<ErrorOptions, ServerError>;
  permissionErrorCallback: ErrorFunction<ErrorOptions, ServerError>;
  serverErrorCallback: ErrorFunction<ErrorOptions, ServerError>;
}

export interface HttpBaseConfig<In, Out, ErrorOptions> {
  url: string;
  errorOptions: ErrorOptions;
  requestConfig?: RequestInit;
  successCallback?: SuccessFunction<In, Out>;
}

export interface HttpQueryConfig<In, Out, ErrorOptions>
    extends HttpBaseConfig<In, Out, ErrorOptions> {
  queryObject?: {[key:string]: string | number};
}

export interface HttpCommandConfig<In, Out, ErrorOptions>
    extends HttpBaseConfig<In, Out, ErrorOptions> {
  body?: unknown;
}

export interface HttpConfig<In, Out, ErrorOptions>
    extends HttpCommandConfig<In, Out, ErrorOptions> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}
