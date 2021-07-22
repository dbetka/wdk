import {HttpCommandConfig, HttpConfig, HttpQueryConfig, HttpServiceConfig, ResponseConfig} from './models/http';
import {WithErrorField, WithWarnField} from "./models/errors";

export class HttpService {
    private static config: HttpServiceConfig;

    constructor(config?: HttpServiceConfig) {
        if (config) {
            HttpService.config = Object.freeze(config);
        }
        if (!this.config) {
            // tslint:disable-next-line:no-console
            console.warn('Please provide configuration!!');
        }
    }

    get config(): HttpServiceConfig {
        return HttpService.config;
    }
    public static changeGlobalConfig(partialConfig: Partial<HttpServiceConfig>) {
        HttpService.config = Object.freeze({...this.config, ...partialConfig})
    }

    public static get<T>(options: HttpQueryConfig): Promise<T> {
        const { url, queryParamsObject } = options;

        const pathVariables = queryParamsObject
            ? HttpService.dataToPathVariables(queryParamsObject)
            : '';

        const requestParams = {...options, url: url + pathVariables, method: 'GET'} as HttpConfig

        return HttpService.handleRequest(requestParams);
    }

    public static post<T>(options: HttpCommandConfig): Promise<T> {
        return HttpService.handleRequest({...options, method: 'POST'});
    }

    public static put<T>(options: HttpCommandConfig): Promise<T> {
        return HttpService.handleRequest({...options, method: 'PUT'});
    }

    public static delete<T>(options: HttpCommandConfig): Promise<T> {
        return HttpService.handleRequest<T>({...options, method: 'DELETE'});
    }

    private static handleRequest<T>(options: HttpConfig): Promise<T> {
        const { url, requestConfig, responseConfig = {} }  = HttpService.prepareRequestData(options)
        const preparedResponseConfig = HttpService.prepareResponseData(responseConfig)
        const { defaultError, errors } = preparedResponseConfig;

        return new Promise<T>((resolve, reject) => {
            fetch(url, {
                ...this.config.defaultRequestConfig,
                ...requestConfig,
                })
                .then(response => HttpService.handleResponse<T>(
                    response,
                    preparedResponseConfig,
                    resolve,
                    reject)
                )
                .catch(
                    // Catch error from network and throw it further
                    (error: string) => reject({
                        error,
                        defaultError,
                        errors,
                        errorCallback: this.config.connectionErrorCallback
                    }
                ));
            }).catch(
            // Catch errors from network (catch above) or business error that has been thrown in handleResponse
                ({
                    error,
                    defaultError,
                    errors,
                    errorCallback
                }) => errorCallback(error, defaultError, errors))
    }
    private static handleResponse<T>(
        response: Response,
        responseConfig: Required<ResponseConfig>,
        resolve: (value: T | PromiseLike<T>) => void,
        reject: (reason?: any) => void
    ) {
        const {
            successCallback,
            errorCallback,
            warnCallback,
            defaultError,
            errors,
            defaultWarn,
            warns,
        } = responseConfig

        response.json()
            .then(data => {
                    HttpService.hasWarn(data)
                        ? warnCallback(data.warn, defaultWarn, warns)
                        : null
                    HttpService.hasNoError(data)
                        ? resolve(successCallback<T>(data))
                        : reject({
                            error: data.error,
                            errors,
                            defaultError,
                            errorCallback
                        })
                }
            )
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

    private static prepareResponseData(responseConfig: ResponseConfig): Required<ResponseConfig> {
        // Set default property/method from HttpServiceConfig if custom is not provided for this request
        responseConfig.successCallback = responseConfig?.successCallback ?? this.config.defaultSuccessCallback;
        responseConfig.warnCallback = responseConfig?.warnCallback ?? this.config.defaultWarnCallback;
        responseConfig.errorCallback = responseConfig?.errorCallback ?? this.config.defaultErrorCallback;
        responseConfig.warns = responseConfig?.warns ?? this.config.defaultWarns
        responseConfig.defaultWarn = responseConfig?.defaultWarn ?? this.config.defaultWarn
        responseConfig.defaultError = responseConfig?.defaultError ?? this.config.defaultError
        responseConfig.errors = responseConfig?.errors ?? this.config.defaultErrors

        return responseConfig as Required<ResponseConfig>
    }


    private static prepareRequestData(options: HttpConfig): HttpConfig {
        const {body, requestConfig = {}} = options;

        options.url = this.config.apiUrl + options.url;

        if (body) {
            requestConfig.body = JSON.stringify(body);
        }

        return options;
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
