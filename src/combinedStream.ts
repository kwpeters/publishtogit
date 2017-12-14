import {PassThrough, Readable, Writable, WritableOptions, Stream} from "stream";

export class CombinedStream extends PassThrough
{
    private _streams: Array<Stream>;
    private _streamEnd: Stream;

    constructor(...streams: Array<Stream>)
    {
        super();
        this._streams = streams;

        this.on('pipe', (source: Readable) => {
            source.unpipe(this);

            let streamEnd: Stream = source;
            for(let i in this._streams) {
                streamEnd = streamEnd.pipe(<Writable>this._streams[i]);
            }
            this._streamEnd = streamEnd;
            // this.transformStream = source;
        });
    }

    pipe<T extends NodeJS.WritableStream>(dest: T, options?: { end?: boolean; }): T
    {
        return this._streamEnd.pipe(dest, options);
    }

}


////////////////////////////////////////////////////////////////////////////////

// import {inherits} from "util";
// import {PassThrough, Readable, Writable, WritableOptions} from "stream";
//
// export const CombinedStream = function(this: any, ...streams: Array<Readable | Writable>) {
//     this.streams = streams;
//     // this.streams = Array.prototype.slice.apply(arguments);
//
//     this.on('pipe', function(this: any, source: Readable) {
//         source.unpipe(this);
//         for(let i in this.streams) {
//             source = source.pipe(this.streams[i]);
//         }
//         this.transformStream = source;
//     });
// };
//
// inherits(CombinedStream, PassThrough);
//
// CombinedStream.prototype.pipe = function(dest: Writable, options: WritableOptions) {
//     return this.transformStream.pipe(dest, options);
// };

// var stream3 = new CombinedStream(stream1, stream2);
// stdin.pipe(stream3).pipe(stdout);


////////////////////////////////////////////////////////////////////////////////

// var util = require('util');
// var PassThrough = require('stream').PassThrough;
//
// var CombinedStream = function() {
//     this.streams = Array.prototype.slice.apply(arguments);
//
//     this.on('pipe', function(source) {
//         source.unpipe(this);
//         for(i in this.streams) {
//             source = source.pipe(this.streams[i]);
//         }
//         this.transformStream = source;
//     });
// };
//
// util.inherits(CombinedStream, PassThrough);
//
// CombinedStream.prototype.pipe = function(dest, options) {
//     return this.transformStream.pipe(dest, options);
// };
//
// var stream3 = new CombinedStream(stream1, stream2);
// stdin.pipe(stream3).pipe(stdout);
