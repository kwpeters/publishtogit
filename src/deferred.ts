
export class Deferred<ResolveType>
{
    public promise: Promise<ResolveType>;
    public resolve: (result: ResolveType) => void;
    public reject: (err: any) => void;

    constructor(){
        this.promise = new Promise((resolve: (result: ResolveType) => void, reject: (err: any) => void) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}
