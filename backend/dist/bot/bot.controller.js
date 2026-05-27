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
exports.BotController = void 0;
const common_1 = require("@nestjs/common");
const bot_service_1 = require("./bot.service");
const bot_dto_1 = require("./dto/bot.dto");
let BotController = class BotController {
    constructor(botService) {
        this.botService = botService;
    }
    getCustomerInfo(phone) {
        return this.botService.getCustomerInfo(phone);
    }
    joinQueue(queueDto) {
        return this.botService.joinQueue(queueDto);
    }
    saveReview(reviewDto) {
        return this.botService.saveReview(reviewDto);
    }
    processAiChat(aiChatDto) {
        return this.botService.processAiChat(aiChatDto);
    }
};
exports.BotController = BotController;
__decorate([
    (0, common_1.Get)('customer'),
    __param(0, (0, common_1.Query)('phone')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BotController.prototype, "getCustomerInfo", null);
__decorate([
    (0, common_1.Post)('queue'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bot_dto_1.QueueDto]),
    __metadata("design:returntype", void 0)
], BotController.prototype, "joinQueue", null);
__decorate([
    (0, common_1.Post)('review'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bot_dto_1.ReviewDto]),
    __metadata("design:returntype", void 0)
], BotController.prototype, "saveReview", null);
__decorate([
    (0, common_1.Post)('ai-chat'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bot_dto_1.AiChatDto]),
    __metadata("design:returntype", void 0)
], BotController.prototype, "processAiChat", null);
exports.BotController = BotController = __decorate([
    (0, common_1.Controller)('bot'),
    __metadata("design:paramtypes", [bot_service_1.BotService])
], BotController);
//# sourceMappingURL=bot.controller.js.map