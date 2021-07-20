import { Communicates } from './communicates';

export type ErrorsDictionary = (string | string[])[][]
export type WithErrorField<T> = T & {error: string | null}

export interface ErrorMessageConfig {
  hard: boolean,
  communicates: Communicates
}
