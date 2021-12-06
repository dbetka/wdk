import {
  HttpCommandConfig,
  HttpConfig,
  HttpQueryConfig,
  HttpServiceConfig,
  SuccessFunction,
} from './models/http';

export class HttpService<ErrorOptions> {
  private config? : HttpServiceConfig<ErrorOptions>;

  public static createInstance<ErrorOptions> (config: HttpServiceConfig<ErrorOptions>): HttpService<ErrorOptions> {
    const instance = new HttpService<ErrorOptions>();
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
      fetch(url, {
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
        HttpService.hasNoError(response)
          ? successCallback
            ? resolve(successCallback(data))
            : resolve(data)
          : reject(this.config?.defaultErrorCallback(data, errorOptions));
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

  private static hasNoError (response: Response) {
    return response.status === 200;
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
