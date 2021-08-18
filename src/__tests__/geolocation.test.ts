import {GeolocationService} from "../geolocation";
import {arrayUtils} from "../array";

const helpers = {
    subs: [] as { watchId: number, callback: Function }[],
    subsCounter: 0,
    isPositive: true,
    posResponse: {
        coords: {
            accuracy: 1,
            altitude: 1,
            altitudeAccuracy: 1,
            latitude: 1,
            longitude: 1,
            heading: 1,
            speed: 1,
        },
        timestamp: 0
    },
    posErrResponse: {
    PERMISSION_DENIED: 0,
    POSITION_UNAVAILABLE: 0,
    TIMEOUT: 0,
    code: 0,
    message: ""
}
}
const positionChanged = () => helpers.subs.map(sub => sub.callback())

const geolocationMock : Geolocation = {
    clearWatch(watchId: number): void {
        const el = helpers.subs.find(el => el.watchId === watchId)
        arrayUtils.removeItem(helpers.subs, el);
    },
    getCurrentPosition(successCallback: PositionCallback, errorCallback: PositionErrorCallback, options: PositionOptions): void {
        if(helpers.isPositive) {
            successCallback(helpers.posResponse)
        } else {
            errorCallback(helpers.posErrResponse)
        }
    },
    watchPosition(successCallback: PositionCallback, errorCallback?: PositionErrorCallback, options?: PositionOptions): number {
        helpers.subs.push({watchId: helpers.subsCounter, callback: successCallback})
        return helpers.subsCounter++;
    }
}
const defaultSuccessCallback = jest.fn()
const defaultErrorCallback = jest.fn()
const errorCallback = jest.fn()
const successCallback = jest.fn()
const geolocationApi =  new GeolocationService({
    defaultErrorCallback,
    defaultSuccessCallback
})
geolocationApi.nativeApi = geolocationMock

describe('geolocationServices', () => {
    beforeEach(() => {
        helpers.isPositive = true;
        helpers.subsCounter = 0
        helpers.subs = []
        jest.clearAllMocks()
    })
    describe('getCurrentPosition', () => {
        it('use default success callback with default options', () => {
            geolocationApi.getCurrentPosition();
            expect(defaultSuccessCallback.mock.calls.length).toBe(1);
        })
        it('use default error callback', () => {
            helpers.isPositive = false;
            geolocationApi.getCurrentPosition();
            expect(defaultErrorCallback.mock.calls.length).toBe(1);
        })
        it('use custom success callback', () => {
            geolocationApi.getCurrentPosition(successCallback);
            expect(successCallback.mock.calls.length).toBe(1);
        })
        it('use custom error callback', () => {
            helpers.isPositive = false;
            geolocationApi.getCurrentPosition(successCallback, errorCallback);
            expect(errorCallback.mock.calls.length).toBe(1);
        })
    })

    describe('subscribe', () => {
        it('trigger default success callback on event', () => {
            const sub = geolocationApi.subscribe();
            positionChanged();
            positionChanged();
            expect(defaultSuccessCallback.mock.calls.length).toBe(2);
        })
        it('unsubsribe works', () => {
            const sub = geolocationApi.subscribe();
            positionChanged();
            sub.unsubscribe()
            positionChanged()
            expect(defaultSuccessCallback.mock.calls.length).toBe(1);
        })
        it('unsubsribe works', () => {
            const sub1 = geolocationApi.subscribe();
            const sub2 = geolocationApi.subscribe();
            positionChanged();
            positionChanged();
            geolocationApi.unsubscribeAll();
            positionChanged()
            expect(defaultSuccessCallback.mock.calls.length).toBe(4);
        })
    })
    describe('promise based', () => {
        it('getCurrentPositionMock success', () => {
            expect.assertions(1);
            return geolocationApi.getCurrentPositionPromise()
                .then(pos => expect(pos).toBe(helpers.posResponse))
        })
        it('getCurrentPositionMock failure', () => {
            expect.assertions(1);
            helpers.isPositive = false
            return geolocationApi.getCurrentPositionPromise()
                .catch(err => expect(err).toBe(helpers.posErrResponse))
        })
        it('isEnabled success', () => {
            expect.assertions(1);
            return geolocationApi.isEnabled()
                .then(result => expect(result).toBe(true))
        })
        it('isEnabled false', () => {
            expect.assertions(1);
            helpers.isPositive = false
            return geolocationApi.isEnabled()
                .then(result => expect(result).toBe(false))
        })
    });
})
