const { listAppPagesQuerySchema } = require('../../../modules/appPage/appPage.validator');

describe('Query Validation Schemas', () => {
    // listAppPagesQuerySchema uses schemas.explorerPaginationSchema (not the
    // standard paginationSchema): the drawer folder tree must render every
    // item of an entity type in a single request, so the cap is 1000.
    describe('listAppPagesQuerySchema', () => {
        it('should validate empty query and set explorer defaults', () => {
            const result = listAppPagesQuerySchema.safeParse({});
            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                page: 1,
                pageSize: 1000,
                search: undefined,
                folderID: undefined
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

        it('should accept pageSize up to the explorer cap of 1000', () => {
            const result = listAppPagesQuerySchema.safeParse({
                pageSize: '1000'
            });
            expect(result.success).toBe(true);
            expect(result.data.pageSize).toBe(1000);
        });

        it('should fail validation when page is less than 1', () => {
            const result = listAppPagesQuerySchema.safeParse({
                page: '0'
            });
            expect(result.success).toBe(false);
        });

        it('should fail validation when pageSize exceeds 1000', () => {
            const result = listAppPagesQuerySchema.safeParse({
                pageSize: '1001'
            });
            expect(result.success).toBe(false);
        });
    });
});
