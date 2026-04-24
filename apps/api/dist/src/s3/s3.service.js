"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto_1 = require("crypto");
let S3Service = class S3Service {
    s3;
    privateBucket = process.env.S3_PRIVATE_BUCKET || 'traventions-private-s3';
    publicBucket = process.env.S3_PUBLIC_BUCKET || 'traventions-public-s3';
    constructor() {
        this.s3 = new client_s3_1.S3Client({
            region: process.env.AWS_REGION || 'ap-southeast-2',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    async upload(file, folder, isPublic = false) {
        if (!file)
            throw new common_1.BadRequestException('No file provided');
        const bucket = isPublic ? this.publicBucket : this.privateBucket;
        const ext = file.originalname.split('.').pop();
        const key = `${folder}/${(0, crypto_1.randomUUID)()}.${ext}`;
        await this.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));
        const url = isPublic
            ? `https://${bucket}.s3.amazonaws.com/${key}`
            : undefined;
        return { key, bucket, url };
    }
    async getSignedUrl(key, bucket, expiresIn = 3600) {
        const b = bucket || this.privateBucket;
        const command = new client_s3_1.GetObjectCommand({ Bucket: b, Key: key });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn });
    }
    async delete(key, bucket) {
        const b = bucket || this.privateBucket;
        await this.s3.send(new client_s3_1.DeleteObjectCommand({ Bucket: b, Key: key }));
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], S3Service);
//# sourceMappingURL=s3.service.js.map