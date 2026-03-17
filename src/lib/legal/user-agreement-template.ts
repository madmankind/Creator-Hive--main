/**
 * User Agreement template for Creator Hive
 *
 * Placeholders: {{variableName}} — replaced at generation time.
 * To update legal text: edit TEMPLATE_BODY only. Do not touch business logic.
 */

export const TEMPLATE_VERSION = 1;

export type AgreementVariables = {
  fullLegalName: string;
  email: string;
  phone: string;
  companyName: string;
  accountType: string;
  country: string;
  city: string;
  onboardingCompletionDate: string;
  agreementIssueDate: string;
  agreementReference: string;
  entityName: string;
  contactEmail: string;
};

export const DEFAULT_ENTITY = "Creator Hive FZE";
export const DEFAULT_CONTACT = "hello@creatorhive.ae";

export function renderTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

export const TEMPLATE_BODY = `
USER AGREEMENT

Agreement Reference: {{agreementReference}}
Effective Date: {{agreementIssueDate}}

PARTIES

1. Creator Hive FZE ("Creator Hive", "we", "us") — a company incorporated in the United Arab Emirates.
2. {{fullLegalName}} ("User", "you") — {{accountType}} using the Creator Hive platform.

Contact details:
- User: {{email}}{{phone}}
- Company (if applicable): {{companyName}}
- Location: {{city}}, {{country}}

Creator Hive contact: {{contactEmail}}

INTRODUCTION

Creator Hive provides a curated marketplace and platform ("Platform") enabling brands ("Brands") and independent professionals ("Creators") to collaborate on marketing, content production, and related services (the "Services"). By using our Platform, you agree to these Terms and Conditions (the "Terms").

This User Agreement is issued to you upon completion of onboarding on {{onboardingCompletionDate}}.

1. DATA PROTECTION & PRIVACY

Creator Hive processes personal data under UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection (PDPL) and, where relevant, under GDPR, UK GDPR, or other applicable data protection laws.

2. NON-CIRCUMVENTION & NO DIRECT CONTACT

You agree that for a period of twelve (12) months from the date of your last introduction to or engagement with any Creator Hive talent through the Platform, you shall not:

(a) Contact, engage, or contract directly with any such talent for the same or similar services outside the Platform;
(b) Circumvent Creator Hive or the Platform to avoid fees or commissions;
(c) Use contact details obtained through the Platform for purposes other than Platform-facilitated campaigns.

This clause survives termination of your account and applies to all talent introduced to you via Creator Hive.

3. PLATFORM & SERVICES "AS IS"

The Platform and Services are provided "as is" and "as available" without warranties of any kind, express or implied. Creator Hive does not guarantee uninterrupted or error-free access to the Platform, the suitability of any Creator for a specific campaign, or the outcomes of any campaign.

4. CAMPAIGN AGREEMENTS

Each campaign is governed by a Campaign Agreement that specifies deliverables, timelines, fees, exclusivity, usage rights, and reporting obligations. Creator Hive provides standard contract templates for convenience. Creator Hive is not a law firm and does not provide legal advice.

5. PAYMENTS, FEES & TAXES

Payments are processed via Creator Hive's designated payment processor. Unless otherwise stated in the Campaign Agreement, payments are due net 30 days after campaign completion. All fees are quoted in AED unless otherwise agreed in writing. VAT and all other applicable taxes are the sole responsibility of the receiving party.

6. GOVERNING LAW & DISPUTE RESOLUTION

These Terms are governed by the federal laws of the United Arab Emirates. Any dispute arising from or in connection with these Terms that is not resolved amicably within 30 days of written notice shall be referred to and finally resolved by arbitration under the Rules of the Dubai International Arbitration Centre (DIAC). Seat of arbitration: Dubai, UAE. Language: English.

7. SIGNATURE

By using the Platform, you acknowledge that you have read, understood, and agree to be bound by this User Agreement.

Signature: _______________________________

Date: _______________________________

Name: {{fullLegalName}}
`;
