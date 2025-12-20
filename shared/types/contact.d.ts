import type { BaseAtViewModel, BaseViewModel, BaseAtViewModel } from "./base";
import type {
  ContactGender as OrmContactGender,
  ContactCommunicationWayType as OrmContactCommunicationWayType,
  ContactCommunicationWayCategory as OrmContactCommunicationWayCategory,
  ContactAddressCategory as OrmContactAddressCategory,
  ContactNoteType as OrmContactNoteType
} from "@prisma/nuxt";

/**
 * Gender classification for contact persons
 * @swagger
 * components:
 *   schemas:
 *     ContactGender:
 *       type: string
 *       enum: [MALE, FEMALE, DIVERSE, NONE]
 *       description: Gender classification for contact persons
 */
export type ContactGender = OrmContactGender;

/**
 * Type of communication method (e.g., email, phone, fax)
 * @swagger
 * components:
 *   schemas:
 *     ContactCommunicationWayType:
 *       type: string
 *       enum: [PHONE, EMAIL, WEB]
 *       description: Type of communication method (e.g., email, phone, fax)
 */
export type ContactCommunicationWayType = OrmContactCommunicationWayType;

/**
 * Category classification for communication ways (e.g., business, personal)
 * @swagger
 * components:
 *   schemas:
 *     ContactCommunicationWayCategory:
 *       type: string
 *       enum: [INVOICING, WORK, FAX, MOBILE, AUTOBOX, NEWSLETTER, PRIVAT, NONE]
 *       description: Category classification for communication ways (e.g., business, personal)
 */
export type ContactCommunicationWayCategory = OrmContactCommunicationWayCategory;

/**
 * Category classification for addresses (e.g., billing, shipping, headquarters)
 * @swagger
 * components:
 *   schemas:
 *     ContactAddressCategory:
 *       type: string
 *       enum: [HEADQUARTER, INVOICE, WORK, DELIVERY, PICKUP, PRIVAT, NONE]
 *       description: Category classification for addresses (e.g., billing, shipping, headquarters)
 */
export type ContactAddressCategory = OrmContactAddressCategory;

/**
 * Type classification for contact notes (e.g., general, meeting, reminder)
 * @swagger
 * components:
 *   schemas:
 *     ContactNoteType:
 *       type: string
 *       enum: [NOTE, CALL, MEETING, OTHER]
 *       description: Type classification for contact notes (e.g., general, meeting, reminder)
 */
export type ContactNoteType = OrmContactNoteType;

/**
 * Represents a country with its ISO code
 * @swagger
 * components:
 *   schemas:
 *     CountryViewModel:
 *       type: object
 *       description: Represents a country with its ISO code
 *       properties:
 *         isoCode:
 *           type: string
 *           description: ISO country code (e.g., DE, US, FR)
 *       required:
 *         - isoCode
 */
export interface CountryViewModel {
  /** ISO country code (e.g., DE, US, FR) */
  isoCode: string;
}

/**
 * Represents a communication method for contacting a person or company
 * @swagger
 * components:
 *   schemas:
 *     ContactCommunicationWayViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseAtViewModel'
 *         - type: object
 *           description: Represents a communication method for contacting a person or company
 *           properties:
 *             type:
 *               $ref: '#/components/schemas/ContactCommunicationWayType'
 *               description: Type of communication method
 *             category:
 *               $ref: '#/components/schemas/ContactCommunicationWayCategory'
 *               description: Category classification of this communication way
 *             value:
 *               type: string
 *               nullable: true
 *               description: The actual communication value (e.g., email address, phone number)
 *           required:
 *             - type
 *             - category
 *             - value
 */
export interface ContactCommunicationWayViewModel extends BaseAtViewModel {
  /** Type of communication method */
  type: ContactCommunicationWayType;
  /** Category classification of this communication way */
  category: ContactCommunicationWayCategory;
  /** The actual communication value (e.g., email address, phone number) */
  value: string | null;
}

/**
 * Represents a physical or postal address for a contact
 * @swagger
 * components:
 *   schemas:
 *     ContactAddressViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseAtViewModel'
 *         - type: object
 *           description: Represents a physical or postal address for a contact
 *           properties:
 *             category:
 *               $ref: '#/components/schemas/ContactAddressCategory'
 *               description: Category classification of this address
 *             address:
 *               type: string
 *               nullable: true
 *               description: Primary address line (street and number)
 *             address2:
 *               type: string
 *               nullable: true
 *               description: Secondary address line (additional information)
 *             address3:
 *               type: string
 *               nullable: true
 *               description: Tertiary address line (additional information)
 *             address4:
 *               type: string
 *               nullable: true
 *               description: Quaternary address line (additional information)
 *             zipCode:
 *               type: string
 *               nullable: true
 *               description: Postal/ZIP code
 *             city:
 *               type: string
 *               nullable: true
 *               description: City name
 *             country:
 *               type: string
 *               description: Country identifier
 *           required:
 *             - category
 *             - address
 *             - address2
 *             - address3
 *             - address4
 *             - zipCode
 *             - city
 *             - country
 */
export interface ContactAddressViewModel extends BaseAtViewModel {
  /** Category classification of this address */
  category: ContactAddressCategory;
  /** Primary address line (street and number) */
  address: string | null;
  /** Secondary address line (additional information) */
  address2: string | null;
  /** Tertiary address line (additional information) */
  address3: string | null;
  /** Quaternary address line (additional information) */
  address4: string | null;
  /** Postal/ZIP code */
  zipCode: string | null;
  /** City name */
  city: string | null;
  /** Country identifier */
  country: string;
}

/**
 * Represents a note or comment associated with a contact
 * @swagger
 * components:
 *   schemas:
 *     ContactNoteViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseAtViewModel'
 *         - type: object
 *           description: Represents a note or comment associated with a contact
 *           properties:
 *             type:
 *               $ref: '#/components/schemas/ContactNoteType'
 *               description: Type classification of this note
 *             timestamp:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               description: Timestamp when the note was created or relevant
 *             content:
 *               type: string
 *               description: The actual content of the note
 *           required:
 *             - type
 *             - timestamp
 *             - content
 */
export interface ContactNoteViewModel extends BaseAtViewModel {
  /** Type classification of this note */
  type: ContactNoteType;
  /** Timestamp when the note was created or relevant */
  timestamp: string | null;
  /** The actual content of the note */
  content: string;
}

/**
 * Represents a person contact with personal details and relationships
 * @swagger
 * components:
 *   schemas:
 *     PersonViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseViewModel'
 *         - type: object
 *           description: Represents a person contact with personal details and relationships
 *           properties:
 *             externalId:
 *               type: string
 *               nullable: true
 *               description: External identifier from third-party systems
 *             firstname:
 *               type: string
 *               nullable: true
 *               description: Person's first name
 *             surename:
 *               type: string
 *               nullable: true
 *               description: Person's middle name or surname
 *             familyname:
 *               type: string
 *               nullable: true
 *               description: Person's family name or last name
 *             gender:
 *               $ref: '#/components/schemas/ContactGender'
 *               description: Person's gender classification
 *             birthdayAt:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               description: Person's date of birth in ISO format
 *             companies:
 *               type: array
 *               description: List of companies this person is associated with and their roles
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     description: Company identifier
 *                   role:
 *                     type: string
 *                     nullable: true
 *                     description: Person's role or position in the company
 *                 required:
 *                   - id
 *                   - role
 *             communicationWays:
 *               type: array
 *               description: List of communication methods for this person
 *               items:
 *                 $ref: '#/components/schemas/ContactCommunicationWayViewModel'
 *             addresses:
 *               type: array
 *               description: List of addresses associated with this person
 *               items:
 *                 $ref: '#/components/schemas/ContactAddressViewModel'
 *             notes:
 *               type: array
 *               description: List of notes and comments about this person
 *               items:
 *                 $ref: '#/components/schemas/ContactNoteViewModel'
 *           required:
 *             - externalId
 *             - firstname
 *             - surename
 *             - familyname
 *             - gender
 *             - birthdayAt
 *             - companies
 *             - communicationWays
 *             - addresses
 *             - notes
 */
export interface PersonViewModel extends BaseViewModel {
  /** External identifier from third-party systems */
  externalId: string | null;
  /** Person's first name */
  firstname: string | null;
  /** Person's middle name or surname */
  surename: string | null;
  /** Person's family name or last name */
  familyname: string | null;
  /** Person's gender classification */
  gender: ContactGender;
  /** Person's date of birth in ISO format */
  birthdayAt: string | null;
  /** List of companies this person is associated with and their roles */
  companies: {
    /** Company identifier */
    id: string;
    /** Person's role or position in the company */
    role: string | null;
  }[];
  /** List of communication methods for this person */
  communicationWays: ContactCommunicationWayViewModel[];
  /** List of addresses associated with this person */
  addresses: ContactAddressViewModel[];
  /** List of notes and comments about this person */
  notes: ContactNoteViewModel[];
}

/**
 * Represents a company contact with business details and relationships
 * @swagger
 * components:
 *   schemas:
 *     CompanyViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseViewModel'
 *         - type: object
 *           description: Represents a company contact with business details and relationships
 *           properties:
 *             externalId:
 *               type: string
 *               nullable: true
 *               description: External identifier from third-party systems
 *             name:
 *               type: string
 *               nullable: true
 *               description: Primary company name
 *             name2:
 *               type: string
 *               nullable: true
 *               description: Secondary company name or additional legal name
 *             customerId:
 *               type: string
 *               nullable: true
 *               description: Customer identifier in business systems
 *             taxId:
 *               type: string
 *               nullable: true
 *               description: Tax identification number
 *             vatId:
 *               type: string
 *               nullable: true
 *               description: VAT identification number
 *             persons:
 *               type: array
 *               description: List of persons associated with this company and their roles
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     description: Person identifier
 *                   role:
 *                     type: string
 *                     nullable: true
 *                     description: Person's role or position in the company
 *                 required:
 *                   - id
 *                   - role
 *             communicationWays:
 *               type: array
 *               description: List of communication methods for this company
 *               items:
 *                 $ref: '#/components/schemas/ContactCommunicationWayViewModel'
 *             addresses:
 *               type: array
 *               description: List of addresses associated with this company
 *               items:
 *                 $ref: '#/components/schemas/ContactAddressViewModel'
 *             notes:
 *               type: array
 *               description: List of notes and comments about this company
 *               items:
 *                 $ref: '#/components/schemas/ContactNoteViewModel'
 *           required:
 *             - externalId
 *             - name
 *             - name2
 *             - customerId
 *             - taxId
 *             - vatId
 *             - persons
 *             - communicationWays
 *             - addresses
 *             - notes
 */
export interface CompanyViewModel extends BaseViewModel {
  /** External identifier from third-party systems */
  externalId: string | null;
  /** Primary company name */
  name: string | null;
  /** Secondary company name or additional legal name */
  name2: string | null;
  /** Customer identifier in business systems */
  customerId: string | null;
  /** Tax identification number */
  taxId: string | null;
  /** VAT identification number */
  vatId: string | null;
  /** List of persons associated with this company and their roles */
  persons: {
    /** Person identifier */
    id: string;
    /** Person's role or position in the company */
    role: string | null;
  }[];
  /** List of communication methods for this company */
  communicationWays: ContactCommunicationWayViewModel[];
  /** List of addresses associated with this company */
  addresses: ContactAddressViewModel[];
  /** List of notes and comments about this company */
  notes: ContactNoteViewModel[];
}

/**
 * Union type representing either a person or company contact
 * @swagger
 * components:
 *   schemas:
 *     ContactViewModel:
 *       oneOf:
 *         - $ref: '#/components/schemas/PersonViewModel'
 *         - $ref: '#/components/schemas/CompanyViewModel'
 *       description: Union type representing either a person or company contact
 */
export type ContactViewModel = PersonViewModel | CompanyViewModel;
