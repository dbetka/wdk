import {HttpService} from "../http-service";
import {HttpServiceConfig} from "../models/http";
import {ErrorsDictionary} from "../models/errors";

/*
It's dummy implementation, what is ok now,
but if we write more tests, we should move it to common file
*/
const setFetchData = (data: Object, error:null | string = null, warn: null | string =null) => {
    // @ts-ignore
    global.fetch = jest.fn(() =>
        Promise.resolve({
            json: () => Promise.resolve({...data, error, warn }),
        }))
}
const setRejectedFetch = (serverError: string) => {
    // @ts-ignore
    setFetchData('test');

    // @ts-ignore
    fetch.mockImplementationOnce(() => Promise.reject(serverError));
}

describe('httpServices', () => {
    describe('without config', () => {
        const noConfigSpy = jest.spyOn(global.console, 'warn')
        new HttpService()
        it('should console.warn', () => {
            expect(noConfigSpy).toBeCalled();
        })
    })

    describe('with proper config', () => {
        // Set it to check side effects, it is cleared before each test
        let assertions = {
            error: '',
            connectionError: '',
            warn: '',
            dataToErrorCallback: {
                error: '',
                errors: [] as ErrorsDictionary,
                defaultError: ''
            },
            dataToWarnCallback: {
                warn: '',
                warns: [] as ErrorsDictionary,
                defaultWarn: ''
            }
        }
        const helpers = {
            connectionError: 'connectionError',
            defaultError: 'defaultErrorCallback',
            defaultWarn: 'defaultWarn',
            customError: 'customErrorCallback',
            customWarn: 'customWarn',
            errorFromServer: 'errorFromSever',
            apiUrl: 'apiUrl',
            urlSegment: '/users',
            testData: {name: 'TestName', surname: 'TestSurname'},
            defaultHeaders: {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        }

        const httpConfig: HttpServiceConfig = {
            apiUrl: helpers.apiUrl,
            defaultRequestConfig: { ...helpers.defaultHeaders },
            connectionErrorCallback: (error: string, defaultError, errors ) =>{
                assertions.connectionError = error
                assertions.dataToErrorCallback = {error, defaultError, errors, }
            } ,
            defaultErrorCallback: (error, defaultError, errors): void => {
                assertions.error = helpers.defaultError
                assertions.dataToErrorCallback = {error, defaultError, errors, }
            },
            defaultSuccessCallback<T>(data: unknown): T {
                return data as T
            },
            defaultWarnCallback: (warn, defaultWarn , warns) => {
                assertions.warn = helpers.defaultWarn
                assertions.dataToWarnCallback = {warn, defaultWarn, warns}
            },
            defaultError: helpers.defaultError,
            defaultWarn: helpers.defaultWarn,
            defaultWarns: [[helpers.defaultWarn]],
            defaultErrors: [[helpers.defaultError]],
        }

        // Get private methods and set Http Config
        const proto = Object.getPrototypeOf(new HttpService(httpConfig))
        // Not used yet, to consider if we should test private methods
        // or exclude inner class from httpService and test it as public methods
        const {
            handleRequest,
            handleResponse,
            hasNoError,
            hasWarn,
            prepareResponseData,
            prepareRequestData,
            dataToPathVariables,
        } = proto.constructor

        beforeEach(() => {
            assertions = {
                error: '',
                connectionError: '',
                warn: '',
                dataToErrorCallback: {
                    error: '',
                    errors: [] as ErrorsDictionary,
                    defaultError: ''
                },
                dataToWarnCallback: {
                    warn: '',
                    warns: [] as ErrorsDictionary,
                    defaultWarn: ''
                }
            }
        });

        describe('positive response', () => {

            it('positive pass get without modify', () => {
                setFetchData({...helpers.testData})
                expect.assertions(1);

                return HttpService.get({
                    url: helpers.urlSegment,
                }).then(data => expect(data).toEqual(helpers.testData))
            })

            it('custom success callback modify response data', () => {
                setFetchData({...helpers.testData})
                expect.assertions(1);

                return HttpService.post<{name: string}>({
                    url: helpers.urlSegment,
                    responseConfig: {
                        // @ts-ignore
                        successCallback: (data: {name :string}) => ({name :data.name +='!'})
                    }
                }).then(data => expect(data.name).toEqual(helpers.testData.name +='!'))
            })

            it('error null is removed from data', () => {
                setFetchData({...helpers.testData, error: null})
                expect.assertions(1);

                return HttpService.get({
                    url: helpers.urlSegment,
                }).then(data => expect(data).toEqual(helpers.testData))
            })

            it('warn null is removed from data', () => {
                setFetchData({...helpers.testData, warn: null})
                expect.assertions(1);

                return HttpService.get({
                    url: helpers.urlSegment,
                }).then(data => expect(data).toEqual(helpers.testData))
            })

        })


        describe('error response', () => {
            it('set network error at fetch reject', () => {
                setRejectedFetch(helpers.connectionError)
                expect.assertions(2);
                return HttpService.get({
                    url: helpers.urlSegment
                }).finally(() => {
                    expect(assertions.connectionError).toEqual(helpers.connectionError)
                    expect(assertions.dataToErrorCallback).toEqual({
                        error: helpers.connectionError,
                        errors: [[helpers.defaultError]],
                        defaultError: helpers.defaultError
                    })
                })
            })

            it('default error set on error get', () => {
                setFetchData({...helpers.testData}, helpers.errorFromServer )
                expect.assertions(2);

                return HttpService.get({
                    url: helpers.urlSegment,
                }).finally(() => {
                    expect(assertions.error).toEqual(helpers.defaultError)
                    expect(assertions.dataToErrorCallback).toEqual({
                        error: helpers.errorFromServer,
                        errors: [[helpers.defaultError]],
                        defaultError: helpers.defaultError
                    })
                })
            })

            it('custom error set on error get', () => {
                setFetchData({...helpers.testData}, helpers.errorFromServer )
                expect.assertions(1);

                return HttpService.get({
                    url: helpers.urlSegment,
                    responseConfig: {
                        errorCallback: () => assertions.error = helpers.customError
                    }
                }).finally(() => expect(assertions.error).toEqual(helpers.customError))
            })

        })
    })
});
