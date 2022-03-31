
import { Logger } from './logger';


export class ConsoleLogger implements Logger {

    public warn(message: string): void {
        console.warn(message);
    }

    public log(message: string): void {
        console.log(message);
    }

    public error(message: string): void {
        console.error(message);
    }

}
