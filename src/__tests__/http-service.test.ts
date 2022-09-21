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
        }));
};
const setRejectedFetch = (serverError: string) => {
    // @ts-ignore
    setFetchData('test');

    // @ts-ignore
    fetch.mockImplementationOnce(() => Promise.reject(serverError));
};

describe('httpServices', () => {
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
    };
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
    };

    type errorOptions = {defaultError: string, errors: ErrorsDictionary};
    type warnOptions = {defaultWarn: string, warns: ErrorsDictionary};

    const httpConfig: HttpServiceConfig<errorOptions, warnOptions> = {
        apiUrl: helpers.apiUrl,
        defaultRequestConfig: { ...helpers.defaultHeaders },
        earlyCatchStrategy: true,
        connectionErrorCallback: (error,  defaultOptions,customOptions, ) => {
            const {defaultError, errors} = { ...defaultOptions, ...customOptions };
            assertions.connectionError = error;
            assertions.dataToErrorCallback = {error, defaultError, errors };
            return error;
        } ,
        defaultErrorCallback: (error, defaultOptions, customOptions) => {
            const {defaultError, errors} = { ...defaultOptions, ...customOptions };
            assertions.error = helpers.defaultError;
            assertions.dataToErrorCallback = {error, defaultError, errors};
            return error;
        },
        defaultSuccessCallback<T>(data: unknown): T {
            return data as T;
        },
        defaultWarnCallback: (warn, defaultOptions, customOptions ) => {
            const { defaultWarn, warns } = { ...defaultOptions, ...customOptions };
            assertions.warn = helpers.defaultWarn;
            assertions.dataToWarnCallback = {warn, defaultWarn, warns};
            return warn;
        },
        defaultErrorConfig: { errors: [[helpers.defaultError]], defaultError: helpers.defaultError},
        defaultWarnConfig: {warns: [[helpers.defaultWarn]], defaultWarn: helpers.defaultWarn}
    };

    const httpService = HttpService.getInstance<errorOptions, warnOptions>(httpConfig);
    beforeEach(() => {
        httpService.changeConfig({earlyCatchStrategy: true});
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
        };
    });

    describe('positive response', () => {

        it('positive pass get without modify', () => {
            setFetchData({...helpers.testData});
            expect.assertions(1);

            return httpService.get({
                url: helpers.urlSegment,
            }).then(data => expect(data).toEqual(helpers.testData));
        });

        it('custom success callback modify response data', () => {
            setFetchData({...helpers.testData});
            expect.assertions(1);

            return httpService.post<{name: string}>({
                url: helpers.urlSegment,
                responseConfig: {
                    // @ts-ignore
                    successCallback: (data: {name :string}) => ({name :data.name +='!'})
                }
            }).then(data => expect(data.name).toEqual(helpers.testData.name +='!'));
        });

        it('error null is removed from data', () => {
            setFetchData({...helpers.testData, error: null});
            expect.assertions(1);

            return httpService.get({
                url: helpers.urlSegment,
            }).then(data => expect(data).toEqual(helpers.testData));
        });

        it('warn null is removed from data', () => {
            setFetchData({...helpers.testData, warn: null});
            expect.assertions(1);

            return httpService.get({
                url: helpers.urlSegment,
            }).then(data => expect(data).toEqual(helpers.testData));
        });

    });


    describe('error response with early catch', () => {
        it('set network error at fetch reject', () => {
            setRejectedFetch(helpers.connectionError);
            expect.assertions(2);
            return httpService.get({
                url: helpers.urlSegment
            }).finally(() => {
                expect(assertions.connectionError).toEqual(helpers.connectionError);
                expect(assertions.dataToErrorCallback).toEqual({
                    error: helpers.connectionError,
                    errors: [[helpers.defaultError]],
                    defaultError: helpers.defaultError
                });
            });
        });

        it('default error set on error get', () => {
            setFetchData({...helpers.testData}, helpers.errorFromServer );
            expect.assertions(2);

            return httpService.get({
                url: helpers.urlSegment,
            })
                .finally(() => {
                expect(assertions.error).toEqual(helpers.defaultError);
                expect(assertions.dataToErrorCallback).toEqual({
                    error: helpers.errorFromServer,
                    errors: [[helpers.defaultError]],
                    defaultError: helpers.defaultError
                });
            });
        });

        it('custom error set on error get', () => {
            setFetchData({...helpers.testData}, helpers.errorFromServer );
            expect.assertions(1);

            return httpService.get({
                url: helpers.urlSegment,
                responseConfig: {
                    errorCallback: () => {
                        assertions.error = helpers.customError;
                        return helpers.customError;
                    }
                }
            }).finally(() => expect(assertions.error).toEqual(helpers.customError));
        });

    });

    describe('error response without early catch', () => {
        beforeEach(() => {
            httpService.changeConfig({earlyCatchStrategy: false});
        });
        it('set network error at fetch reject', () => {
            setRejectedFetch(helpers.connectionError);
            expect.assertions(3);
            return httpService.get({
                url: helpers.urlSegment
            }).catch((error) => {
                expect(error).toEqual(helpers.connectionError);
                expect(assertions.connectionError).toEqual(helpers.connectionError);
                expect(assertions.dataToErrorCallback).toEqual({
                    error: helpers.connectionError,
                    errors: [[helpers.defaultError]],
                    defaultError: helpers.defaultError
                });
            });
        });


        it('custom error set on error get', () => {
            setFetchData({...helpers.testData}, helpers.errorFromServer );
            expect.assertions(2);

            return httpService.get({
                url: helpers.urlSegment,
                responseConfig: {
                    errorCallback: () => {
                        assertions.error = helpers.customError;
                        return helpers.customError;
                    }
                }
            }).catch((error) => {
                expect(error).toEqual(helpers.customError);
                expect(assertions.error).toEqual(helpers.customError);
            });
        });

        it('default error set on error get', () => {
            setFetchData({...helpers.testData}, helpers.errorFromServer );
            expect.assertions(3);

            return httpService.get({
                url: helpers.urlSegment,
            })
                .catch((error) => {
                    expect(error).toEqual(helpers.errorFromServer);
                    expect(assertions.error).toEqual(helpers.defaultError);
                    expect(assertions.dataToErrorCallback).toEqual({
                        error: helpers.errorFromServer,
                        errors: [[helpers.defaultError]],
                        defaultError: helpers.defaultError
                    });
                });
        });
        });
});
