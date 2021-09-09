import {
    ErrorFunction,
    HttpCommandConfig,
    HttpConfig,
    HttpQueryConfig,
    HttpServiceConfig,
    ResponseConfig
} from './models/http';
import {WithErrorField, WithWarnField} from "./models/errors";

export class HttpService<ErrorOptions, WarnOptions> {
    private static config: HttpServiceConfig<any, any>
    private static instance: unknown;

    private constructor() {}

    public static getInstance<ErrorOptions, WarnOption>(
        config?: HttpServiceConfig<ErrorOptions, WarnOption>
    ): HttpService<ErrorOptions, WarnOption> {

        if(!HttpService.instance) {
            if(!config) {
                throw Error('You have to provide config with first getInstance() execution')
            }
            this.instance = new HttpService<ErrorOptions, WarnOption>()
            this.config = config as HttpServiceConfig<ErrorOptions, WarnOption>
        }
        return HttpService.instance as HttpService<ErrorOptions, WarnOption>
    }

    get config(): HttpServiceConfig<ErrorOptions, WarnOptions> {
        return HttpService.config;
    }

    public changeConfig(partialConfig: Partial<HttpServiceConfig<ErrorOptions, WarnOptions>>): void {
        HttpService.config = {...this.config, ...partialConfig}
    }

    public get<T>(options: HttpQueryConfig<ErrorOptions, WarnOptions>): Promise<T> {
        const { url, queryObject } = options;

        const pathVariables = queryObject
            ? HttpService.dataToPathVariables(queryObject)
            : '';

        const requestParams = {...options, url: url + pathVariables, method: 'GET'} as HttpConfig<ErrorOptions, WarnOptions>

        return this.handleRequest(requestParams);
    }

    public  post<T>(options: HttpCommandConfig<ErrorOptions, WarnOptions>): Promise<T> {
        return this.handleRequest({...options, method: 'POST'});
    }

    public  put<T>(options: HttpCommandConfig<ErrorOptions, WarnOptions>): Promise<T> {
        return this.handleRequest({...options, method: 'PUT'});
    }

    public  delete<T>(options: HttpCommandConfig<ErrorOptions, WarnOptions>): Promise<T> {
        return this.handleRequest<T>({...options, method: 'DELETE'});
    }

    private  handleRequest<T>(options: HttpConfig<ErrorOptions, WarnOptions>): Promise<T> {
        const { url, requestConfig, responseConfig = {} }  = this.prepareRequestData(options)
        const preparedResponseConfig = this.prepareResponseData(responseConfig)
        const { errorConfig } = preparedResponseConfig;

        let requestResult = new Promise<T>((resolve, reject) => {
            fetch(url, {
                ...this.config.defaultRequestConfig,
                ...requestConfig,
                })
                .then(response => this.handleResponse<T>(
                    response,
                    preparedResponseConfig,
                    resolve,
                    reject)
                )
                .catch((error) => reject(this.errorAction(error, this.config.connectionErrorCallback, errorConfig)))
        })

        if (this.config.earlyCatchStrategy) {
            return requestResult.catch(
                ({
                     error,
                     errorConfig,
                     errorCallback
                 }) => errorCallback(error, this.config.defaultErrorConfig, errorConfig ))
            }

        return requestResult
    }
    private  handleResponse<T>(
        response: Response,
        responseConfig: Required<ResponseConfig<ErrorOptions, WarnOptions>>,
        resolve: (value: T | PromiseLike<T>) => void,
        reject: (reason?: any) => void
    ) {
        const {
            successCallback,
            errorCallback,
            warnCallback,
            errorConfig,
            warnConfig
        } = responseConfig

        response.json()
            .then(data => {
                    HttpService.hasWarn(data)
                        ? warnCallback(data.warn, warnConfig, this.config.defaultWarnConfig)
                        : null
                    HttpService.hasNoError(data)
                        ? resolve(successCallback<T>(data))
                        : reject(this.errorAction(data.error, errorCallback, errorConfig))
                }
            )
    }



    private prepareResponseData(responseConfig: ResponseConfig<ErrorOptions, WarnOptions>): Required<ResponseConfig<ErrorOptions, WarnOptions>> {

        responseConfig.successCallback = responseConfig?.successCallback ?? this.config.defaultSuccessCallback;
        responseConfig.warnCallback = responseConfig?.warnCallback ?? this.config.defaultWarnCallback;
        responseConfig.errorCallback = responseConfig?.errorCallback ?? this.config.defaultErrorCallback;

        return responseConfig as Required<ResponseConfig<ErrorOptions, WarnOptions>>
    }


    private prepareRequestData(options: HttpConfig<ErrorOptions, WarnOptions>): HttpConfig<ErrorOptions, WarnOptions> {
        const {body, method, requestConfig = {}} = options;
        options.url = this.config.apiUrl + options.url;
        requestConfig.method = method;

        if (body) {
            requestConfig.body = JSON.stringify(body);
        }

        options.requestConfig = requestConfig;
        return options;
    }

    private errorAction(error: string, errorCallback: ErrorFunction<ErrorOptions>, errorConfig?: ErrorOptions )
    : { error: string, errorConfig?: ErrorOptions, errorCallback: ErrorFunction<ErrorOptions> } | string | Error {
        if (this.config.earlyCatchStrategy) {
            return { error, errorConfig, errorCallback }
        }
        return errorCallback(error, this.config.defaultErrorConfig, errorConfig)
    }

    private static hasNoError(data: WithErrorField<unknown>) {
        if (data.error === null) {
            // @ts-ignore
            delete data.error;
            return true
        } else {
            return false
        }
    }
    private static hasWarn(data: WithWarnField<unknown>) {
        if (data.warn === null) {
            // @ts-ignore
            delete data.warn;
            return false
        } else {
            return true
        }
    }

    private static dataToPathVariables(data: Object): string {
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
