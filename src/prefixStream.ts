import {Transform} from "stream";
import {Deferred} from "./deferred";


export class PrefixStream extends Transform
{
    //region Private Members
    private _prefixBuf: Buffer;
    private _partial: Buffer;
    private _flushedDeferred: Deferred<void>;
    //endregion


    constructor(prefix: string)
    {
        super();
        this._prefixBuf = Buffer.from(`[${prefix}] `);
        this._flushedDeferred = new Deferred<void>();
    }


    public _transform(chunk: Buffer | string, encoding: string, done: Function)
    {
        // Convert to a Buffer.
        const chunkBuf: Buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;

        this._partial = this._partial && this._partial.length ?
            Buffer.concat([this._partial, chunkBuf]) :
            chunkBuf;

        let index: number;

        // While complete lines exist, push them.
        while ((index = this._partial.indexOf('\n')) !== -1) {
            const line = this._partial.slice(0, ++index);
            this._partial = this._partial.slice(index);
            this.push(Buffer.concat([this._prefixBuf, line]))
        }
        done();
    }


    public _flush(done: Function)
    {
        if (this._partial && this._partial.length)
        {
            this.push(Buffer.concat([this._prefixBuf, this._partial]));
        }
        this._flushedDeferred.resolve(undefined);

        done();
    }


    public get flushedPromise()
    {
        return this._flushedDeferred.promise;
    }
}
