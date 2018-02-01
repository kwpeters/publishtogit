export class Url
{
    public static setProtocol(url: string, newProtocol: string): string
    {
        return url.replace(/^\w+?(?=:\/\/)/, newProtocol);
    }
}
