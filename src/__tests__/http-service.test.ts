import {ErrorMessage} from "../error-message";
import {HttpService} from "../http-service";
import {HttpConfig, HttpServiceConfig} from "../models/http";
import {ErrorsDictionary} from "../models/errors";
/*function initHttpService() {
    return new HttpService(
        {
            apiUrl: 'https://localhost:3030',
            connectionErrorHandler: 'test',
            defaultErrorCallback: catchError,
            defaultSuccessCallback: (data) => data,
        });
}
function catchError (errorData) {
    let errorMessage = errorData.defaultError;
    for (const [codes, message] of errorData.errors) {
        for (const singleCode of codes) {
            if (errorData.data.error === singleCode) {
                errorMessage = message;
                break;
            }
        }
    }
    new ErrorMessage(errorMessage)
}*/

describe('httpServices', () => {

    const noConfigSpy = jest.spyOn(global.console, 'warn')
    const proto = Object.getPrototypeOf(new HttpService()).constructor
    const priv = {
        handleRequest: proto.handleRequest,
        hasNoError: proto.hasNoError,
    }
    let connectionError;
    const config: HttpServiceConfig = {
        connectionErrorCallback(error: string): void { connectionError = 'erorr' },
        defaultErrorCallback(error: string, defaultError: string, errors: ErrorsDictionary): unknown {
            return undefined;
        },
        defaultRequestConfig: {},
        defaultSuccessCallback<T>(data: unknown): T {
            return data as T
        },
        apiUrl:'localhost'
    }
    // @ts-ignore
    global.fetch = jest.fn(() =>
        Promise.resolve({
            json: () => Promise.resolve({ rates: { CAD: 1.42 } }),
        })
    );
    beforeEach(() => {
        const x = new HttpService(config);
        connectionError = '';
    })

    describe('', () => {
        it('console warn has been called because not configutation', () => {
            expect(noConfigSpy).toBeCalled();
        })
        it('should work', () => {
            const result = priv.hasNoError({error: null})
            expect(result).toBe(true);
        })

        it('xd', () => {
            HttpService.get({url: '2', responseConfig: {errors: [[['x']]], defaultError: 'default'}})
                .then(() => console.log('xd'));
        })
    })
});
