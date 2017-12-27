import {PassThrough, Readable, Writable, Stream} from "stream";

export class CombinedStream extends PassThrough
{
    private _streams: Array<Stream>;
    private _streamEnd: Stream;

    constructor(...streams: Array<Stream>)
    {
        super();
        this._streams = streams;

        this.on("pipe", (source: Readable) => {
            source.unpipe(this);

            let streamEnd: Stream = source;

            for (let streamIndex: number = 0; streamIndex < this._streams.length; ++streamIndex)
            {
                streamEnd = streamEnd.pipe(<Writable>this._streams[streamIndex]);
            }

            this._streamEnd = streamEnd;
        });
    }

    public pipe<T extends NodeJS.WritableStream>(dest: T, options?: { end?: boolean; }): T
    {
        return this._streamEnd.pipe(dest, options);
    }

}
