import { Communicates } from './communicates';

export type ErrorsDictionary = (string | string[])[][];

export interface ErrorMessageConfig {
  hard: boolean;
  communicates: Communicates;
}
