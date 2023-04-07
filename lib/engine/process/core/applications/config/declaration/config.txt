interface IConfig {
    package: string,
    version: string,
    languages: { supported: string[], default: string },
    local?: boolean,
    routing?: { mode: string, ssr: boolean },
    layout?: string,
    params?: any,
    ssr?: { host: string, local: string },
    backend?: { host: string, local: string }
}

declare const cfg: IConfig;

export default cfg;
