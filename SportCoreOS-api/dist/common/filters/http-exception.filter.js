"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Error interno del servidor';
        let errorType = 'InternalServerError';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'object' && res !== null) {
                message = res.message || res.error || exception.message;
                errorType = res.error || exception.name;
            }
            else {
                message = res || exception.message;
                errorType = exception.name;
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            errorType = exception.name;
        }
        const errorPayload = {
            success: false,
            statusCode: status,
            error: errorType,
            message,
            path: request.url,
            method: request.method,
            timestamp: new Date().toISOString(),
        };
        if (status >= common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(`[${request.method}] ${request.url} - Status: ${status}`, exception instanceof Error ? exception.stack : JSON.stringify(exception));
        }
        else {
            this.logger.warn(`[${request.method}] ${request.url} - Status: ${status} - Msg: ${JSON.stringify(message)}`);
        }
        response.status(status).json(errorPayload);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=http-exception.filter.js.map