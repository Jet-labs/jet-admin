const { schemas, validate, validateAll, z } = require('../../../utils/validation.utils');

describe('validation.utils', () => {
    it('validate stores parsed body data and calls next', () => {
        const middleware = validate(
            z.object({
                pageSize: z.coerce.number().int().min(1),
            })
        );
        const req = global.testUtils.createMockRequest({
            body: { pageSize: '10' },
        });
        const res = global.testUtils.createMockResponse();
        const next = global.testUtils.createMockNext();

        middleware(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.validated.body).toEqual({ pageSize: 10 });
        expect(req.body).toEqual({ pageSize: 10 });
        expect(res.status).not.toHaveBeenCalled();
    });

    it('validate sends a 400 response when parsing fails', () => {
        const middleware = validate(
            z.object({
                pageSize: z.coerce.number().int().min(1),
            })
        );
        const req = global.testUtils.createMockRequest({
            body: { pageSize: '0' },
        });
        const res = global.testUtils.createMockResponse();
        const next = global.testUtils.createMockNext();

        middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                error: expect.any(Object),
            })
        );
    });

    it('validate preserves exact validation issues in the response payload', () => {
        const middleware = validate(
            z.object({
                sourceVariable: z.string().min(1, 'Use mustache syntax like {{ctx.input.customerID}} instead of a raw ctx.input.customerID path'),
            })
        );
        const req = global.testUtils.createMockRequest({
            body: { sourceVariable: '' },
        });
        const res = global.testUtils.createMockResponse();
        const next = global.testUtils.createMockNext();

        middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'sourceVariable: Use mustache syntax like {{ctx.input.customerID}} instead of a raw ctx.input.customerID path',
                details: {
                    issues: [{
                        path: 'sourceVariable',
                        message: 'Use mustache syntax like {{ctx.input.customerID}} instead of a raw ctx.input.customerID path',
                        type: 'too_small',
                    }],
                },
            },
        });
    });

    it('validateAll parses params and query sources together', () => {
        const middleware = validateAll({
            params: z.object({ tenantID: schemas.uuidSchema }),
            query: schemas.paginationSchema,
        });
        const req = global.testUtils.createMockRequest({
            params: { tenantID: '550e8400-e29b-41d4-a716-446655440000' },
            query: { page: '2', pageSize: '5' },
        });
        const res = global.testUtils.createMockResponse();
        const next = global.testUtils.createMockNext();

        middleware(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.validated.params).toEqual({
            tenantID: '550e8400-e29b-41d4-a716-446655440000',
        });
        expect(req.validated.query).toEqual({ page: 2, pageSize: 5 });
        expect(req.query).toEqual({ page: 2, pageSize: 5 });
    });

    it('cronScheduleSchema accepts standard cron expressions', () => {
        expect(schemas.cronScheduleSchema.parse('*/5 * * * *')).toBe('*/5 * * * *');
        expect(() => schemas.cronScheduleSchema.parse('not-a-cron')).toThrow();
    });
});
