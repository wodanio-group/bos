import { prisma } from "~~/lib/prisma.server";
import { authMiddlewarePascomConnector } from "~~/server/utils/auth";

/**
 * @swagger
 * /api/pascom/connector/contact:
 *   get:
 *     summary: Export contacts for Pascom connector
 *     description: Retrieves all companies and persons with their contact information in CSV format for Pascom phone system integration
 *     tags: [Integrations]
 *     security:
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved contacts in CSV format
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               example: |
 *                 "displayname";"phone";"givenname";"surname";"organisation";"email";"mobile";"homephone";"fax";"homepage";"customernumber"
 *                 "Acme Corp";"555-1234";"";"";Acme Corp";"info@acme.com";"555-5678";"";"555-9012";"www.acme.com";"CUST001"
 *                 "John Doe";"555-2345";"John";"Doe";"Acme Corp";"john@acme.com";"555-6789";"555-3456";"";"";"CUST001"
 *       401:
 *         description: Unauthorized - Invalid or missing Basic authentication credentials
 *       500:
 *         description: Internal server error
 */
export default defineEventHandler(async (event) => {
  await authMiddlewarePascomConnector(event);
  const rows: string[][] = [
    ['displayname', 'phone', 'givenname', 'surname', 'organisation', 'email', 'mobile', 'homephone', 'fax', 'homepage', 'customernumber'],
  ];

  const companies = await prisma.company.findMany({
            include: {
              contactCommunicationWays: true,
            },
          }),
        persons = await prisma.person.findMany({
            include: {
              contactCommunicationWays: true,
              companyPersons: {
                include: {
                  company: true,
                },
              },
            },
          });

  rows.push(...companies.map(company => ([
    companyDisplayName(company),
    (company.contactCommunicationWays ?? []).filter(o => o.type === 'PHONE').find(o => o.category === 'WORK')?.value
      ?? (company.contactCommunicationWays ?? []).filter(o => o.type === 'PHONE').at(0)?.value
      ?? '',
    '', 
    '',
    companyDisplayName(company),
    (company.contactCommunicationWays ?? []).filter(o => o.type === 'EMAIL').find(o => o.category === 'WORK')?.value
      ?? (company.contactCommunicationWays ?? []).filter(o => o.type === 'EMAIL').at(0)?.value
      ?? '',
    (company.contactCommunicationWays ?? []).filter(o => o.type === 'PHONE').find(o => o.category === 'MOBILE')?.value ?? '',
    (company.contactCommunicationWays ?? []).filter(o => o.type === 'PHONE').find(o => o.category === 'PRIVAT')?.value ?? '',
    (company.contactCommunicationWays ?? []).filter(o => o.type === 'PHONE').find(o => o.category === 'FAX')?.value ?? '',
    (company.contactCommunicationWays ?? []).filter(o => o.type === 'WEB').find(o => o.category === 'WORK')?.value
      ?? (company.contactCommunicationWays ?? []).filter(o => o.type === 'WEB').at(0)?.value
      ?? '',
    company.customerId ?? '',
  ])));

  rows.push(...persons.map(person => {
    const company = person.companyPersons.at(0)?.company;
    return [
      personDisplayName(person),
      (person.contactCommunicationWays ?? []).filter(o => o.type === 'PHONE').find(o => o.category === 'WORK')?.value
        ?? (person.contactCommunicationWays ?? []).filter(o => o.type === 'PHONE').at(0)?.value
        ?? '',
      person.firstname ?? '', 
      person.surename ?? person.familyname ?? '', 
      company ? companyDisplayName(company) : '',
      (person.contactCommunicationWays ?? []).filter(o => o.type === 'EMAIL').find(o => o.category === 'WORK')?.value
        ?? (person.contactCommunicationWays ?? []).filter(o => o.type === 'EMAIL').at(0)?.value
        ?? '',
      (person.contactCommunicationWays ?? []).filter(o => o.type === 'PHONE').find(o => o.category === 'MOBILE')?.value ?? '',
      (person.contactCommunicationWays ?? []).filter(o => o.type === 'PHONE').find(o => o.category === 'PRIVAT')?.value ?? '',
      (person.contactCommunicationWays ?? []).filter(o => o.type === 'PHONE').find(o => o.category === 'FAX')?.value ?? '',
      (person.contactCommunicationWays ?? []).filter(o => o.type === 'WEB').find(o => o.category === 'WORK')?.value
        ?? (person.contactCommunicationWays ?? []).filter(o => o.type === 'WEB').at(0)?.value
        ?? '',
      company?.customerId ?? '',
    ];
  }));

  setHeader(event, "Content-Type", "text/csv; charset=utf-8");
  return rows
    .map(line => '"'+line.join('";"')+'"')
    .join('\n');
});
