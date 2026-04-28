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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const auctions_service_1 = require("./auctions.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const client_1 = require("@prisma/client");
let AuctionsController = class AuctionsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    create(body, req) {
        return this.svc.create({ ...body, clientId: body.clientId || req.user.companyId });
    }
    findAll(status, clientId) {
        return this.svc.findAll(status, clientId);
    }
    findAllBids(auctionId) {
        return this.svc.findAllBids(auctionId);
    }
    findOne(id) {
        return this.svc.findOne(id);
    }
    schedule(id, body) {
        return this.svc.schedule(id, body);
    }
    updateStatus(id, status) {
        return this.svc.updateStatus(id, status);
    }
    sealedBid(id, body, req, file) {
        const amount = parseFloat(body.amount);
        if (isNaN(amount))
            throw new common_1.BadRequestException('amount is required and must be a number');
        return this.svc.submitSealedBid(id, req.user.userId, amount, file, body.remarks);
    }
    selectWinner(id, vendorId) {
        return this.svc.selectWinner(id, vendorId);
    }
    uploadFinalQuote(id, file, type) {
        return this.svc.uploadFinalQuote(id, file, type);
    }
    approveQuote(id) {
        return this.svc.approveQuote(id);
    }
    rejectQuote(id, remarks) {
        return this.svc.rejectQuote(id, remarks);
    }
};
exports.AuctionsController = AuctionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('bids'),
    __param(0, (0, common_1.Query)('auctionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "findAllBids", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/schedule'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "schedule", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/sealed-bid'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "sealedBid", null);
__decorate([
    (0, common_1.Patch)(':id/winner'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('vendorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "selectWinner", null);
__decorate([
    (0, common_1.Post)(':id/final-quote'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "uploadFinalQuote", null);
__decorate([
    (0, common_1.Patch)(':id/approve-quote'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "approveQuote", null);
__decorate([
    (0, common_1.Patch)(':id/reject-quote'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('remarks')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "rejectQuote", null);
exports.AuctionsController = AuctionsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('auctions'),
    __metadata("design:paramtypes", [auctions_service_1.AuctionsService])
], AuctionsController);
//# sourceMappingURL=auctions.controller.js.map