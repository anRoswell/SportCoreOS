"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentClubId = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentClubId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.clubId || request.user?.clubId;
});
//# sourceMappingURL=tenant.decorator.js.map