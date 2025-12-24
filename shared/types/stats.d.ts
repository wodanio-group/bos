/**
 * @swagger
 * components:
 *   schemas:
 *     StatsKey:
 *       type: string
 *       enum: [TOTAL_COMPANY_COUNT, TOTAL_PERSON_COUNT]
 *       description: Available statistics keys
 *     StatsItem:
 *       type: object
 *       description: Individual statistics item with key and value
 *       properties:
 *         key:
 *           $ref: '#/components/schemas/StatsKey'
 *         value:
 *           type: number
 *           description: The numerical value of the statistic
 *       required:
 *         - key
 *         - value
 */
export type StatsKey = 'TOTAL_COMPANY_COUNT' | 'TOTAL_PERSON_COUNT';

export interface StatsItem {
  key: StatsKey;
  value: number;
}
