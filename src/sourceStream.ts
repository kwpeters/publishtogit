import {Readable, ReadableOptions} from "stream";

export class SourceStream extends Readable
{
    //region Private Data Members
    private _data: Array<string>;
    private _curIndex: number = 0;
    //endregion


    constructor(data: Array<string> | string, opts?: ReadableOptions) {
        super(opts);

        if (Array.isArray(data))
        {
            this._data = data;
        }
        else
        {
            this._data = [data];
        }

    }


    public _read() {

        if (this._curIndex >= this._data.length)
        {
            this.push(null);
        }
        else
        {
            const buf = Buffer.from(this._data[this._curIndex]);
            this.push(buf);
        }

        this._curIndex++;
    }
}
