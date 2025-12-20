import type { OptionKey as OrmOptionKey } from "~~/lib/prisma.server";

/**
 * @swagger
 * components:
 *   schemas:
 *     OptionKey:
 *       type: string
 *       description: Key type for application configuration options (defined in the database schema)
 */
export type OptionKey = OrmOptionKey;

/**
 * @swagger
 * components:
 *   schemas:
 *     OptionValue:
 *       description: Value type for application options, can be of any type (string, number, boolean, object, or array)
 *       oneOf:
 *         - type: string
 *         - type: number
 *         - type: boolean
 *         - type: object
 *         - type: array
 */
export type OptionValue = any;

/**
 * @swagger
 * components:
 *   schemas:
 *     OptionSet:
 *       type: object
 *       description: Represents a single option key-value pair for application configuration
 *       properties:
 *         key:
 *           type: string
 *           description: The unique identifier key for the option
 *         value:
 *           description: The value associated with the option key (can be of any type)
 *           oneOf:
 *             - type: string
 *             - type: number
 *             - type: boolean
 *             - type: object
 *             - type: array
 *       required:
 *         - key
 *         - value
 */
export type OptionSet = {
  /**
   * The unique identifier key for the option
   */
  key: OptionKey;
  /**
   * The value associated with the option key
   */
  value: OptionValue;
};

/**
 * @swagger
 * components:
 *   schemas:
 *     OptionViewModel:
 *       type: object
 *       description: View model representation of an application option with timestamps
 *       properties:
 *         key:
 *           type: string
 *           description: The unique identifier key for the option
 *         value:
 *           description: The value associated with the option key (can be of any type)
 *           oneOf:
 *             - type: string
 *             - type: number
 *             - type: boolean
 *             - type: object
 *             - type: array
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the option was last updated
 *       required:
 *         - key
 *         - value
 *         - updatedAt
 */
export interface OptionViewModel {
  /**
   * The unique identifier key for the option
   */
  key: OptionKey;
  /**
   * The value associated with the option key
   */
  value: OptionValue;
  /**
   * Timestamp when the option was last updated
   */
  updatedAt: string;
}
