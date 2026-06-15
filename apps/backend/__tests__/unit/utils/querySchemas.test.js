const { listAppPagesQuerySchema } = require('../../../modules/appPage/appPage.validator');

describe('Query Validation Schemas', () => {
    describe('listAppPagesQuerySchema', () => {
        it('should validate empty query and set defaults', () => {
            const result = listAppPagesQuerySchema.safeParse({});
            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                page: 1,
                pageSize: 20,
                search: undefined
            });
        });

        it('should coerce string values for page and pageSize to numbers', () => {
            const result = listAppPagesQuerySchema.safeParse({
                page: '5',
                pageSize: '15',
                search: 'home'
            });
            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                page: 5,
                pageSize: 15,
                search: 'home'
            });
        });

        it('should fail validation when page is less than 1', () => {
            const result = listAppPagesQuerySchema.safeParse({
                page: '0'
            });
            expect(result.success).toBe(false);
        });

        it('should fail validation when pageSize exceeds 100', () => {
            const result = listAppPagesQuerySchema.safeParse({
                pageSize: '101'
            });
            expect(result.success).toBe(false);
        });
    });
});
