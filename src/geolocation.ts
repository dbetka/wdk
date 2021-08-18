export interface GeolocationServiceConfig {
    defaultPositionOptions?: PositionOptions,
    defaultErrorCallback?: PositionErrorCallback,
    defaultSuccessCallback?: PositionCallback,
}

export class GeolocationService {
    private subscribersIds = [] as number[]
    public nativeApi = navigator.geolocation;
    public defaultPositionOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: Infinity, // ms
        maximumAge: 0, // ms
    }

    constructor(config: GeolocationServiceConfig) {
        this.defaultErrorCallback = config?.defaultErrorCallback ?? this.defaultErrorCallback
        this.defaultSuccessCallback = config?.defaultSuccessCallback ?? this.defaultSuccessCallback
        this.defaultPositionOptions = {...this.defaultPositionOptions, ...config?.defaultPositionOptions}
    }

    private readonly defaultErrorCallback: PositionErrorCallback = (err) => console.log(err);
    private readonly defaultSuccessCallback: PositionCallback = (opt) => console.log(opt);

    public subscribe (
        successCallback = this.defaultSuccessCallback,
        errorCallback = this.defaultErrorCallback,
        options = this.defaultPositionOptions
    )  {
        const id = this.nativeApi.watchPosition(successCallback, errorCallback, options);
        this.subscribersIds.push(id);
        return { unsubscribe: () => this.nativeApi.clearWatch(id) };
    }
    public unsubscribeAll = () => {
        this.subscribersIds.forEach(id => {
            this.nativeApi.clearWatch(id);
        });
        this.subscribersIds = [];
    };
    public getCurrentPosition = (
        successCallback = this.defaultSuccessCallback,
        errorCallback = this.defaultErrorCallback,
        options = this.defaultPositionOptions): void =>
        this.nativeApi.getCurrentPosition(successCallback, errorCallback, options);

    public getCurrentPositionPromise = (options = this.defaultPositionOptions): Promise<GeolocationPosition> =>
        new Promise((resolve, reject) =>
            this.nativeApi.getCurrentPosition(resolve, reject, options));

    public isEnabled(options = this.defaultPositionOptions): Promise<boolean> {
        return this.getCurrentPositionPromise(options)
            .then(() => true)
            .catch(() => false);
    }
}
