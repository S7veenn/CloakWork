export interface ContractPaths {
    readonly zkConfigPath: string;
    readonly privateStateStoreName: string;
}
export declare const contractPaths: {
    task: ContractPaths;
    proof: ContractPaths;
    matching: ContractPaths;
};
export interface Config {
    readonly indexer: string;
    readonly indexerWS: string;
    readonly node: string;
    readonly proofServer: string;
}
export declare class TestnetRemoteConfig implements Config {
    indexer: string;
    indexerWS: string;
    node: string;
    proofServer: string;
    constructor();
}
