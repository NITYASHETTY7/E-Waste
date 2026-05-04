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
exports.RequirementsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const requirements_service_1 = require("./requirements.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let RequirementsController = class RequirementsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    create(body, file, req) {
        let invitedVendorIds = [];
        if (body.invitedVendorIds) {
            try {
                invitedVendorIds = typeof body.invitedVendorIds === 'string'
                    ? JSON.parse(body.invitedVendorIds)
                    : body.invitedVendorIds;
            }
            catch {
                invitedVendorIds = body.invitedVendorIds
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
            }
        }
        return this.svc.create({
            ...body,
            clientId: body.clientId || req.user.companyId,
            invitedVendorIds,
            file,
        });
    }
    findAll(clientId) {
        return this.svc.findAll(clientId);
    }
    findOne(id) {
        return this.svc.findOne(id);
    }
    uploadProcessed(id, file) {
        return this.svc.uploadProcessedSheet(id, file);
    }
    clientApprove(id, body) {
        return this.svc.clientApprove(id, body);
    }
    adminApprove(id, req) {
        return this.svc.adminApprove(id, req.user?.userId);
    }
    getSignedUrl(id, field) {
        return this.svc.getSignedUrl(id, field);
    }
};
exports.RequirementsController = RequirementsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], RequirementsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequirementsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequirementsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/processed-sheet'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RequirementsController.prototype, "uploadProcessed", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RequirementsController.prototype, "clientApprove", null);
__decorate([
    (0, common_1.Patch)(':id/admin-approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RequirementsController.prototype, "adminApprove", null);
__decorate([
    (0, common_1.Get)(':id/download/:field'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('field')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RequirementsController.prototype, "getSignedUrl", null);
exports.RequirementsController = RequirementsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('requirements'),
    __metadata("design:paramtypes", [requirements_service_1.RequirementsService])
], RequirementsController);
//# sourceMappingURL=requirements.controller.js.map