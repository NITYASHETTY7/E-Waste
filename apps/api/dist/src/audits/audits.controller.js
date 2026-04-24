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
exports.AuditsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const audits_service_1 = require("./audits.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AuditsController = class AuditsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    invite(body) {
        return this.svc.inviteVendors(body.requirementId, body.vendorIds);
    }
    findAll(vendorId, requirementId) {
        return this.svc.findAllInvitations(vendorId, requirementId);
    }
    findOne(id) {
        return this.svc.findOneInvitation(id);
    }
    respond(id, status) {
        return this.svc.respondToInvitation(id, status);
    }
    shareSpoc(id, body) {
        return this.svc.shareSpoc(id, body);
    }
    submitReport(id, body, req, photos) {
        return this.svc.submitReport(id, {
            productMatch: body.productMatch === 'true',
            remarks: body.remarks,
            vendorUserId: req.user.userId,
            photos,
        });
    }
};
exports.AuditsController = AuditsController;
__decorate([
    (0, common_1.Post)('invite'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "invite", null);
__decorate([
    (0, common_1.Get)('invitations'),
    __param(0, (0, common_1.Query)('vendorId')),
    __param(1, (0, common_1.Query)('requirementId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('invitations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('invitations/:id/respond'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "respond", null);
__decorate([
    (0, common_1.Patch)('invitations/:id/spoc'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "shareSpoc", null);
__decorate([
    (0, common_1.Post)('invitations/:id/report'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('photos')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Array]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "submitReport", null);
exports.AuditsController = AuditsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('audits'),
    __metadata("design:paramtypes", [audits_service_1.AuditsService])
], AuditsController);
//# sourceMappingURL=audits.controller.js.map