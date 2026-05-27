"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdvModule = void 0;
const common_1 = require("@nestjs/common");
const pdv_controller_1 = require("./pdv.controller");
const pdv_service_1 = require("./pdv.service");
let PdvModule = class PdvModule {
};
exports.PdvModule = PdvModule;
exports.PdvModule = PdvModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [pdv_controller_1.PdvController],
        providers: [pdv_service_1.PdvService],
    })
], PdvModule);
//# sourceMappingURL=pdv.module.js.map