import {HttpCommandConfig, HttpConfig, HttpQueryConfig, HttpServiceConfig, ResponseConfig} from './models/http';
import {WithErrorField} from "./models/errors";

export class HttpService {
    private static config: HttpServiceConfig;

    constructor(config?: HttpServiceConfig) {
        if (config) {
            HttpService.config = config;
        }
        if (!this.config) {
            // tslint:disable-next-line:no-console
            console.warn('Please provide configuration!!');
        }
    }

    get config(): HttpServiceConfig {
        return HttpService.config;
    }

    public static get<T>(options: HttpQueryConfig): Promise<T> {
        const {url, queryParamsObject, requestConfig, responseConfig} = options;

        const pathVariables = queryParamsObject
            ? HttpService.dataToPathVariables(queryParamsObject)
            : '';

        const requestParams = {url: url + pathVariables, requestConfig, responseConfig, method: 'GET' as 'GET'};

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
        const {url, requestConfig, responseConfig} = HttpService.prepareDataForRequestAndResponse(options)
        const {defaultError, errors, successCallback, errorCallback} = responseConfig as Required<ResponseConfig>

        return new Promise<T>((resolve, reject) => {
            fetch(url, {
                ...this.config.defaultRequestConfig,
                ...requestConfig,
            })
                .then(response => response.json())
                .then(data => {
                        HttpService.hasNoError(data)
                            ? resolve(successCallback<T>(data))
                            : reject(errorCallback(data.error, defaultError, errors))
                    }
                )
                .catch(() => reject(this.config.connectionErrorCallback));
        })

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


    private static prepareDataForRequestAndResponse(options: HttpConfig): HttpConfig {
        const {body, requestConfig = {}, responseConfig} = options;
        responseConfig.errorCallback = responseConfig?.errorCallback ?? HttpService.config.defaultErrorCallback;
        responseConfig.successCallback = responseConfig?.successCallback ?? HttpService.config.defaultSuccessCallback;
        options.url = this.config.apiUrl;

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
