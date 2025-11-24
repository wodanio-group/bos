import type { BaseAtViewModel, BaseViewModel, BaseAtViewModel } from "./base";
import type {
  ContactGender as OrmContactGender, 
  ContactCommunicationWayType as OrmContactCommunicationWayType,
  ContactCommunicationWayCategory as OrmContactCommunicationWayCategory,
  ContactAddressCategory as OrmContactAddressCategory,
  ContactNoteType as OrmContactNoteType
} from "@prisma/nuxt";

export type ContactGender = OrmContactGender; 

export type ContactCommunicationWayType = OrmContactCommunicationWayType;

export type ContactCommunicationWayCategory = OrmContactCommunicationWayCategory;

export type ContactAddressCategory = OrmContactAddressCategory;

export type ContactNoteType = OrmContactNoteType;

export interface CountryViewModel {
  isoCode: string;
}

export interface ContactCommunicationWayViewModel extends BaseAtViewModel {
  type: ContactCommunicationWayType;
  category: ContactCommunicationWayCategory;
  value: string | null;
}

export interface ContactAddressViewModel extends BaseAtViewModel {
  category: ContactAddressCategory;
  address: string | null;
  address2: string | null;
  address3: string | null;
  address4: string | null;
  zipCode: string | null;
  city: string | null;
  country: string;
}

export interface ContactNoteViewModel extends BaseAtViewModel {
  type: ContactNoteType;
  timestamp: string | null;
  content: string;
}

export interface PersonViewModel extends BaseViewModel {
  externalId: string | null;
  firstname: string | null;
  surename: string | null;
  familyname: string | null;
  gender: ContactGender;
  birthdayAt: string | null;
  companies: {
    id: string;
    main: boolean;
    role: string | null;
  }[];
  communicationWays: ContactCommunicationWayViewModel[];
  addresses: ContactAddressViewModel[];
  notes: ContactNoteViewModel[];
}

export interface CompanyViewModel extends BaseViewModel {
  externalId: string | null;
  name: string | null;
  name2: string | null;
  customerId: string | null;
  taxId: string | null;
  vatId: string | null;
  persons: {
    id: string;
    role: string | null;
  }[];
  communicationWays: ContactCommunicationWayViewModel[];
  addresses: ContactAddressViewModel[];
  notes: ContactNoteViewModel[];
}

export type ContactViewModel = PersonViewModel | CompanyViewModel;
