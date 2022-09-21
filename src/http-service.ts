import {
  HttpCommandConfig,
  HttpConfig,
  HttpQueryConfig,
  HttpServiceConfig,
  SuccessFunction,
} from './models/http';

export class HttpService<ErrorOptions, ServerError> {
  private config? : HttpServiceConfig<ErrorOptions, ServerError>;

  public static createInstance<ErrorOptions, ServerError> (config: HttpServiceConfig<ErrorOptions, ServerError>): HttpService<ErrorOptions, ServerError> {
    const instance = new HttpService<ErrorOptions, ServerError>();
    instance.config = config;
    return instance;
  }

  public get<In, Out> (options: HttpQueryConfig<In, Out, ErrorOptions>): Promise<Out> {
    const { url, queryObject } = options;

    const pathVariables = queryObject
      ? HttpService.dataToPathVariables(queryObject)
      : '';

    const requestParams = { ...options, url: url + pathVariables, method: 'GET' } as HttpConfig<In, Out, ErrorOptions>;

    return this.handleRequest<In, Out>(requestParams);
  }

  public post<In, Out> (options: HttpCommandConfig<In, Out, ErrorOptions>): Promise<Out> {
    return this.handleRequest({ ...options, method: 'POST' });
  }

  public put<In, Out> (options: HttpCommandConfig<In, Out, ErrorOptions>): Promise<Out> {
    return this.handleRequest({ ...options, method: 'PUT' });
  }

  public delete<In, Out> (options: HttpCommandConfig<In, Out, ErrorOptions>): Promise<Out> {
    return this.handleRequest({ ...options, method: 'DELETE' });
  }

  private handleRequest<In, Out> (options: HttpConfig<In, Out, ErrorOptions>): Promise<Out> {
    const { url, requestConfig, successCallback = null, errorOptions } = this.prepareRequestData(options);
    return new Promise<Out>((resolve, reject) => {
      const fetchMethod = this.config?.fetchProxy || fetch;

      fetchMethod(url, {
        ...this.config!.defaultRequestConfig,
        ...requestConfig,
      })
        .then(response => this.handleResponse<In, Out>(
          response,
          successCallback,
          errorOptions,
          resolve,
          reject),
        )
        .catch((error) => reject(this.config?.connectionErrorCallback(error, errorOptions)));
    });
  }

  private handleResponse<In, Out> (
    response: Response,
    successCallback: SuccessFunction<In, Out> | null,
    errorOptions: ErrorOptions,
    resolve: (value: Out | PromiseLike<Out>) => void,
    reject: (reason?: any) => void,
  ) {

    response.json()
      .then(data => {
        switch (response.status) {
          case 200: {
            successCallback
              ? resolve(successCallback(data))
              : resolve(data);
            break;
          }
          case 401: {
            reject(this.config?.permissionErrorCallback(data, errorOptions));
            break;
          }
          case 500: {
            reject(this.config?.serverErrorCallback(data, errorOptions));
            break;
          }
          default: {
            reject(this.config?.defaultErrorCallback(data, errorOptions));
          }
        }
      },
      );
  }

  private prepareRequestData<In, Out> (options: HttpConfig<In, Out, ErrorOptions>): HttpConfig<In, Out, ErrorOptions> {
    const { body, method, requestConfig = {} } = options;
    options.url = this.config!.apiUrl + options.url;
    requestConfig.method = method;

    if (body) {
      requestConfig.body = JSON.stringify(body);
    }

    options.requestConfig = requestConfig;
    return options;
  }

  private static dataToPathVariables (data: {[key:string]: string | number}): string {
    let pathData = '';
    if (Object.keys(data).length > 0) {
      pathData += '?';
      pathData += Object
        .entries(data)
        .map(([key, val]) => key + '=' + val)
        .join('&');
    }
    return pathData;
  }
}
