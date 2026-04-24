"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupsModule = void 0;
const common_1 = require("@nestjs/common");
const pickups_service_1 = require("./pickups.service");
const pickups_controller_1 = require("./pickups.controller");
let PickupsModule = class PickupsModule {
};
exports.PickupsModule = PickupsModule;
exports.PickupsModule = PickupsModule = __decorate([
    (0, common_1.Module)({
        controllers: [pickups_controller_1.PickupsController],
        providers: [pickups_service_1.PickupsService],
    })
], PickupsModule);
//# sourceMappingURL=pickups.module.js.map