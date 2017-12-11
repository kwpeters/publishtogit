import {Writable, WritableOptions} from "stream";

export class CollectorStream extends Writable
{
    //region Private Data Members
    private _collected: Array<string> = [];
    //endregion


    constructor(opts?: WritableOptions)
    {
        super(opts);
    }


    public _write(chunk: string | Buffer, encoding: string, callback: Function)
    {
        const strData = chunk.toString();
        this._collected.push(strData);
        callback();
    }


    public get collected(): Array<string>
    {
        return this._collected;
    }
}
