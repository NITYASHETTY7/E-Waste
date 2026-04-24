export declare class S3Service {
    private s3;
    private privateBucket;
    private publicBucket;
    constructor();
    upload(file: Express.Multer.File, folder: string, isPublic?: boolean): Promise<{
        key: string;
        bucket: string;
        url?: string;
    }>;
    getSignedUrl(key: string, bucket?: string, expiresIn?: number): Promise<string>;
    delete(key: string, bucket?: string): Promise<void>;
}
