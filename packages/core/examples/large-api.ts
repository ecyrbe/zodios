import { makeApi, ZodiosCore, type ZodiosOptions } from "../src";
import { z } from "zod";

const CategoryEnum = z.enum([
  "hris",
  "ats",
  "accounting",
  "ticketing",
  "crm",
  "mktg",
  "filestorage",
]);
const AccountDetails = z
  .object({
    id: z.string().uuid(),
    integration: z.string(),
    integration_slug: z.string(),
    category: CategoryEnum.nullable(),
    end_user_origin_id: z.string(),
    end_user_organization_name: z.string(),
    end_user_email_address: z.string().email(),
    status: z.string(),
    webhook_listener_url: z.string().url(),
    is_duplicate: z.boolean().nullable(),
  })
  .partial();
const CategoriesEnum = z.enum([
  "hris",
  "ats",
  "accounting",
  "ticketing",
  "crm",
  "mktg",
  "filestorage",
]);
const AccountIntegration = z.object({
  name: z.string(),
  categories: z.array(CategoriesEnum).optional(),
  image: z.string().url().nullish(),
  square_image: z.string().url().nullish(),
  color: z
    .string()
    .max(18)
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .optional(),
  slug: z.string().optional(),
});
const AccountToken = z.object({
  account_token: z.string(),
  integration: AccountIntegration,
});
const ClassificationEnum = z.enum([
  "ASSET",
  "EQUITY",
  "EXPENSE",
  "LIABILITY",
  "REVENUE",
]);
const AccountStatusEnum = z.enum(["ACTIVE", "PENDING", "INACTIVE"]);
const CurrencyEnum = z.enum([
  "XUA",
  "AFN",
  "AFA",
  "ALL",
  "ALK",
  "DZD",
  "ADP",
  "AOA",
  "AOK",
  "AON",
  "AOR",
  "ARA",
  "ARS",
  "ARM",
  "ARP",
  "ARL",
  "AMD",
  "AWG",
  "AUD",
  "ATS",
  "AZN",
  "AZM",
  "BSD",
  "BHD",
  "BDT",
  "BBD",
  "BYN",
  "BYB",
  "BYR",
  "BEF",
  "BEC",
  "BEL",
  "BZD",
  "BMD",
  "BTN",
  "BOB",
  "BOL",
  "BOV",
  "BOP",
  "BAM",
  "BAD",
  "BAN",
  "BWP",
  "BRC",
  "BRZ",
  "BRE",
  "BRR",
  "BRN",
  "BRB",
  "BRL",
  "GBP",
  "BND",
  "BGL",
  "BGN",
  "BGO",
  "BGM",
  "BUK",
  "BIF",
  "XPF",
  "KHR",
  "CAD",
  "CVE",
  "KYD",
  "XAF",
  "CLE",
  "CLP",
  "CLF",
  "CNX",
  "CNY",
  "CNH",
  "COP",
  "COU",
  "KMF",
  "CDF",
  "CRC",
  "HRD",
  "HRK",
  "CUC",
  "CUP",
  "CYP",
  "CZK",
  "CSK",
  "DKK",
  "DJF",
  "DOP",
  "NLG",
  "XCD",
  "DDM",
  "ECS",
  "ECV",
  "EGP",
  "GQE",
  "ERN",
  "EEK",
  "ETB",
  "EUR",
  "XBA",
  "XEU",
  "XBB",
  "XBC",
  "XBD",
  "FKP",
  "FJD",
  "FIM",
  "FRF",
  "XFO",
  "XFU",
  "GMD",
  "GEK",
  "GEL",
  "DEM",
  "GHS",
  "GHC",
  "GIP",
  "XAU",
  "GRD",
  "GTQ",
  "GWP",
  "GNF",
  "GNS",
  "GYD",
  "HTG",
  "HNL",
  "HKD",
  "HUF",
  "IMP",
  "ISK",
  "ISJ",
  "INR",
  "IDR",
  "IRR",
  "IQD",
  "IEP",
  "ILS",
  "ILP",
  "ILR",
  "ITL",
  "JMD",
  "JPY",
  "JOD",
  "KZT",
  "KES",
  "KWD",
  "KGS",
  "LAK",
  "LVL",
  "LVR",
  "LBP",
  "LSL",
  "LRD",
  "LYD",
  "LTL",
  "LTT",
  "LUL",
  "LUC",
  "LUF",
  "MOP",
  "MKD",
  "MKN",
  "MGA",
  "MGF",
  "MWK",
  "MYR",
  "MVR",
  "MVP",
  "MLF",
  "MTL",
  "MTP",
  "MRU",
  "MRO",
  "MUR",
  "MXV",
  "MXN",
  "MXP",
  "MDC",
  "MDL",
  "MCF",
  "MNT",
  "MAD",
  "MAF",
  "MZE",
  "MZN",
  "MZM",
  "MMK",
  "NAD",
  "NPR",
  "ANG",
  "TWD",
  "NZD",
  "NIO",
  "NIC",
  "NGN",
  "KPW",
  "NOK",
  "OMR",
  "PKR",
  "XPD",
  "PAB",
  "PGK",
  "PYG",
  "PEI",
  "PEN",
  "PES",
  "PHP",
  "XPT",
  "PLN",
  "PLZ",
  "PTE",
  "GWE",
  "QAR",
  "XRE",
  "RHD",
  "RON",
  "ROL",
  "RUB",
  "RUR",
  "RWF",
  "SVC",
  "WST",
  "SAR",
  "RSD",
  "CSD",
  "SCR",
  "SLL",
  "XAG",
  "SGD",
  "SKK",
  "SIT",
  "SBD",
  "SOS",
  "ZAR",
  "ZAL",
  "KRH",
  "KRW",
  "KRO",
  "SSP",
  "SUR",
  "ESP",
  "ESA",
  "ESB",
  "XDR",
  "LKR",
  "SHP",
  "XSU",
  "SDD",
  "SDG",
  "SDP",
  "SRD",
  "SRG",
  "SZL",
  "SEK",
  "CHF",
  "SYP",
  "STN",
  "STD",
  "TVD",
  "TJR",
  "TJS",
  "TZS",
  "XTS",
  "THB",
  "XXX",
  "TPE",
  "TOP",
  "TTD",
  "TND",
  "TRY",
  "TRL",
  "TMT",
  "TMM",
  "USD",
  "USN",
  "USS",
  "UGX",
  "UGS",
  "UAH",
  "UAK",
  "AED",
  "UYW",
  "UYU",
  "UYP",
  "UYI",
  "UZS",
  "VUV",
  "VES",
  "VEB",
  "VEF",
  "VND",
  "VNN",
  "CHE",
  "CHW",
  "XOF",
  "YDD",
  "YER",
  "YUN",
  "YUD",
  "YUM",
  "YUR",
  "ZWN",
  "ZRN",
  "ZRZ",
  "ZMW",
  "ZMK",
  "ZWD",
  "ZWR",
  "ZWL",
]);
const RemoteData = z.object({
  path: z.string(),
  data: z.object({}).partial().passthrough().optional(),
});
const Account = z
  .object({
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    name: z.string().nullable(),
    description: z.string().nullable(),
    classification: ClassificationEnum.nullable(),
    type: z.string().nullable(),
    status: AccountStatusEnum.nullable(),
    current_balance: z.number().nullable(),
    currency: CurrencyEnum.nullable(),
    account_number: z.string().nullable(),
    parent_account: z.string().uuid().nullable(),
    company: z.string().uuid().nullable(),
    remote_was_deleted: z.boolean(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedAccountList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(Account),
  })
  .partial();
const AccountRequest = z
  .object({
    name: z.string().nullable(),
    description: z.string().nullable(),
    classification: ClassificationEnum.nullable(),
    type: z.string().nullable(),
    status: AccountStatusEnum.nullable(),
    current_balance: z.number().nullable(),
    currency: CurrencyEnum.nullable(),
    account_number: z.string().nullable(),
    parent_account: z.string().uuid().nullable(),
    company: z.string().uuid().nullable(),
    integration_params: z.object({}).partial().passthrough().nullable(),
    linked_account_params: z.object({}).partial().passthrough().nullable(),
  })
  .partial();
const AccountEndpointRequest = z.object({ model: AccountRequest });
const ValidationProblemSource = z.object({ pointer: z.string() });
const WarningValidationProblem = z.object({
  source: ValidationProblemSource.optional(),
  title: z.string(),
  detail: z.string(),
  problem_type: z.string(),
});
const ErrorValidationProblem = z.object({
  source: ValidationProblemSource.optional(),
  title: z.string(),
  detail: z.string(),
  problem_type: z.string(),
});
const DebugModelLogSummary = z.object({
  url: z.string(),
  method: z.string(),
  status_code: z.number().int(),
});
const DebugModeLog = z.object({
  log_id: z.string(),
  dashboard_view: z.string(),
  log_summary: DebugModelLogSummary,
});
const AccountResponse = z.object({
  model: Account,
  warnings: z.array(WarningValidationProblem),
  errors: z.array(ErrorValidationProblem),
  logs: z.array(DebugModeLog).optional(),
});
const LinkedAccountStatus = z.object({
  linked_account_status: z.string(),
  can_make_request: z.boolean(),
});
const MetaResponse = z.object({
  request_schema: z.object({}).partial().passthrough(),
  remote_field_classes: z.object({}).partial().passthrough().optional(),
  status: LinkedAccountStatus.optional(),
  has_conditional_params: z.boolean(),
  has_required_linked_account_params: z.boolean(),
});
const AddressTypeEnum = z.enum(["BILLING", "SHIPPING"]);
const CountryEnum = z.enum([
  "AF",
  "AX",
  "AL",
  "DZ",
  "AS",
  "AD",
  "AO",
  "AI",
  "AQ",
  "AG",
  "AR",
  "AM",
  "AW",
  "AU",
  "AT",
  "AZ",
  "BS",
  "BH",
  "BD",
  "BB",
  "BY",
  "BE",
  "BZ",
  "BJ",
  "BM",
  "BT",
  "BO",
  "BQ",
  "BA",
  "BW",
  "BV",
  "BR",
  "IO",
  "BN",
  "BG",
  "BF",
  "BI",
  "CV",
  "KH",
  "CM",
  "CA",
  "KY",
  "CF",
  "TD",
  "CL",
  "CN",
  "CX",
  "CC",
  "CO",
  "KM",
  "CG",
  "CD",
  "CK",
  "CR",
  "CI",
  "HR",
  "CU",
  "CW",
  "CY",
  "CZ",
  "DK",
  "DJ",
  "DM",
  "DO",
  "EC",
  "EG",
  "SV",
  "GQ",
  "ER",
  "EE",
  "SZ",
  "ET",
  "FK",
  "FO",
  "FJ",
  "FI",
  "FR",
  "GF",
  "PF",
  "TF",
  "GA",
  "GM",
  "GE",
  "DE",
  "GH",
  "GI",
  "GR",
  "GL",
  "GD",
  "GP",
  "GU",
  "GT",
  "GG",
  "GN",
  "GW",
  "GY",
  "HT",
  "HM",
  "VA",
  "HN",
  "HK",
  "HU",
  "IS",
  "IN",
  "ID",
  "IR",
  "IQ",
  "IE",
  "IM",
  "IL",
  "IT",
  "JM",
  "JP",
  "JE",
  "JO",
  "KZ",
  "KE",
  "KI",
  "KW",
  "KG",
  "LA",
  "LV",
  "LB",
  "LS",
  "LR",
  "LY",
  "LI",
  "LT",
  "LU",
  "MO",
  "MG",
  "MW",
  "MY",
  "MV",
  "ML",
  "MT",
  "MH",
  "MQ",
  "MR",
  "MU",
  "YT",
  "MX",
  "FM",
  "MD",
  "MC",
  "MN",
  "ME",
  "MS",
  "MA",
  "MZ",
  "MM",
  "NA",
  "NR",
  "NP",
  "NL",
  "NC",
  "NZ",
  "NI",
  "NE",
  "NG",
  "NU",
  "NF",
  "KP",
  "MK",
  "MP",
  "NO",
  "OM",
  "PK",
  "PW",
  "PS",
  "PA",
  "PG",
  "PY",
  "PE",
  "PH",
  "PN",
  "PL",
  "PT",
  "PR",
  "QA",
  "RE",
  "RO",
  "RU",
  "RW",
  "BL",
  "SH",
  "KN",
  "LC",
  "MF",
  "PM",
  "VC",
  "WS",
  "SM",
  "ST",
  "SA",
  "SN",
  "RS",
  "SC",
  "SL",
  "SG",
  "SX",
  "SK",
  "SI",
  "SB",
  "SO",
  "ZA",
  "GS",
  "KR",
  "SS",
  "ES",
  "LK",
  "SD",
  "SR",
  "SJ",
  "SE",
  "CH",
  "SY",
  "TW",
  "TJ",
  "TZ",
  "TH",
  "TL",
  "TG",
  "TK",
  "TO",
  "TT",
  "TN",
  "TR",
  "TM",
  "TC",
  "TV",
  "UG",
  "UA",
  "AE",
  "GB",
  "UM",
  "US",
  "UY",
  "UZ",
  "VU",
  "VE",
  "VN",
  "VG",
  "VI",
  "WF",
  "EH",
  "YE",
  "ZM",
  "ZW",
]);
const Address = z
  .object({
    type: AddressTypeEnum.nullable(),
    street_1: z.string().nullable(),
    street_2: z.string().nullable(),
    city: z.string().nullable(),
    state: z.unknown().nullable(),
    country_subdivision: z.string().nullable(),
    country: CountryEnum.nullable(),
    zip_code: z.string().nullable(),
  })
  .partial();
const AccountingAttachment = z
  .object({
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    file_name: z.string().nullable(),
    file_url: z.string().max(2000).url().nullable(),
    company: z.string().uuid().nullable(),
    remote_was_deleted: z.boolean(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedAccountingAttachmentList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(AccountingAttachment),
  })
  .partial();
const AccountingAttachmentRequest = z
  .object({
    file_name: z.string().nullable(),
    file_url: z.string().max(2000).url().nullable(),
    company: z.string().uuid().nullable(),
    integration_params: z.object({}).partial().passthrough().nullable(),
    linked_account_params: z.object({}).partial().passthrough().nullable(),
  })
  .partial();
const AccountingAttachmentEndpointRequest = z.object({
  model: AccountingAttachmentRequest,
});
const AccountingAttachmentResponse = z.object({
  model: AccountingAttachment,
  warnings: z.array(WarningValidationProblem),
  errors: z.array(ErrorValidationProblem),
  logs: z.array(DebugModeLog).optional(),
});
const ModelOperation = z.object({
  model_name: z.string(),
  available_operations: z.array(z.string()),
  required_post_parameters: z.array(z.string()),
  supported_fields: z.array(z.string()),
});
const AvailableActions = z.object({
  integration: AccountIntegration,
  passthrough_available: z.boolean(),
  available_model_operations: z.array(ModelOperation).optional(),
});
const ReportItem = z
  .object({
    remote_id: z.string().nullable(),
    name: z.string().nullable(),
    value: z.number().nullable(),
    sub_items: z.object({}).partial().passthrough(),
    company: z.string().uuid().nullable(),
  })
  .partial();
const BalanceSheet = z
  .object({
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    name: z.string().nullable(),
    currency: CurrencyEnum.nullable(),
    company: z.string().uuid().nullable(),
    date: z.string().datetime().nullable(),
    net_assets: z.number().nullable(),
    assets: z.array(ReportItem),
    liabilities: z.array(ReportItem),
    equity: z.array(ReportItem),
    remote_generated_at: z.string().datetime().nullable(),
    remote_was_deleted: z.boolean(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedBalanceSheetList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(BalanceSheet),
  })
  .partial();
const CashFlowStatement = z
  .object({
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    name: z.string().nullable(),
    currency: CurrencyEnum.nullable(),
    company: z.string().uuid().nullable(),
    start_period: z.string().datetime().nullable(),
    end_period: z.string().datetime().nullable(),
    cash_at_beginning_of_period: z.number().nullable(),
    cash_at_end_of_period: z.number().nullable(),
    operating_activities: z.array(ReportItem),
    investing_activities: z.array(ReportItem),
    financing_activities: z.array(ReportItem),
    remote_generated_at: z.string().datetime().nullable(),
    remote_was_deleted: z.boolean(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedCashFlowStatementList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(CashFlowStatement),
  })
  .partial();
const CommonModelScopesDisabledModelsEnabledActionsEnum = z.enum([
  "ENABLED_ACTION_READ",
  "ENABLED_ACTION_WRITE",
]);
const CommonModelScopesDisabledModels = z.object({
  model_name: z.string(),
  model_id: z.string(),
  enabled_actions: z.array(CommonModelScopesDisabledModelsEnabledActionsEnum),
  is_disabled: z.boolean(),
  disabled_fields: z.array(z.string()),
});
const CommonModelScopeData = z.object({
  common_models: z.array(CommonModelScopesDisabledModels),
  linked_account_id: z.string().uuid().optional(),
});
const CommonModelScopes = z.object({
  organization_level_scopes: CommonModelScopeData.optional(),
  scope_overrides: z.array(CommonModelScopeData),
});
const EnabledActionsEnum = z.enum(["READ", "WRITE"]);
const CommonModelScopesPostInnerDeserializerRequest = z.object({
  model_id: z.string().min(1),
  enabled_actions: z.array(EnabledActionsEnum),
  disabled_fields: z.array(z.string()),
});
const CommonModelScopesUpdateSerializer = z.object({
  common_models: z.array(CommonModelScopesPostInnerDeserializerRequest),
});
const AccountingPhoneNumber = z
  .object({ number: z.string().nullable(), type: z.string().nullable() })
  .partial();
const CompanyInfo = z
  .object({
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    name: z.string().nullable(),
    legal_name: z.string().nullable(),
    tax_number: z.string().nullable(),
    fiscal_year_end_month: z.number().int().gte(1).lte(12).nullable(),
    fiscal_year_end_day: z.number().int().gte(1).lte(31).nullable(),
    currency: CurrencyEnum.nullable(),
    remote_created_at: z.string().datetime().nullable(),
    urls: z.array(z.string()).nullable(),
    addresses: z.array(Address),
    phone_numbers: z.array(AccountingPhoneNumber),
    remote_was_deleted: z.boolean(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedCompanyInfoList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(CompanyInfo),
  })
  .partial();
const Status7d1Enum = z.enum(["ACTIVE", "ARCHIVED"]);
const Contact = z
  .object({
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    name: z.string().nullable(),
    is_supplier: z.boolean().nullable(),
    is_customer: z.boolean().nullable(),
    email_address: z.string().nullable(),
    tax_number: z.string().nullable(),
    status: Status7d1Enum.nullable(),
    currency: z.string().nullable(),
    remote_updated_at: z.string().datetime().nullable(),
    company: z.string().uuid().nullable(),
    addresses: z.array(z.string()),
    phone_numbers: z.array(AccountingPhoneNumber),
    remote_was_deleted: z.boolean(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedContactList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(Contact),
  })
  .partial();
const AccountingPhoneNumberRequest = z
  .object({
    number: z.string().nullable(),
    type: z.string().nullable(),
    integration_params: z.object({}).partial().passthrough().nullable(),
    linked_account_params: z.object({}).partial().passthrough().nullable(),
  })
  .partial();
const ContactRequest = z
  .object({
    name: z.string().nullable(),
    is_supplier: z.boolean().nullable(),
    is_customer: z.boolean().nullable(),
    email_address: z.string().nullable(),
    tax_number: z.string().nullable(),
    status: Status7d1Enum.nullable(),
    currency: z.string().nullable(),
    company: z.string().uuid().nullable(),
    addresses: z.array(z.string()),
    phone_numbers: z.array(AccountingPhoneNumberRequest),
    integration_params: z.object({}).partial().passthrough().nullable(),
    linked_account_params: z.object({}).partial().passthrough().nullable(),
  })
  .partial();
const ContactEndpointRequest = z.object({ model: ContactRequest });
const ContactResponse = z.object({
  model: Contact,
  warnings: z.array(WarningValidationProblem),
  errors: z.array(ErrorValidationProblem),
  logs: z.array(DebugModeLog).optional(),
});
const CreditNoteStatusEnum = z.enum(["SUBMITTED", "AUTHORIZED", "PAID"]);
const CreditNoteLineItem = z.object({
  item: z.string().uuid().nullish(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  quantity: z
    .string()
    .regex(/^-?\d{0,24}(?:\.\d{0,8})?$/)
    .nullish(),
  memo: z.string().nullish(),
  unit_price: z
    .string()
    .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
    .nullish(),
  tax_rate: z.string().uuid().nullish(),
  total_line_amount: z
    .string()
    .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
    .nullish(),
  tracking_category: z.string().uuid().nullish(),
  tracking_categories: z.array(z.string()),
  account: z.string().uuid().nullish(),
  company: z.string().uuid().nullish(),
  remote_id: z.string().nullish(),
});
const CreditNote = z
  .object({
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    transaction_date: z.string().datetime().nullable(),
    status: CreditNoteStatusEnum.nullable(),
    number: z.string().nullable(),
    contact: z.string().uuid().nullable(),
    company: z.string().uuid().nullable(),
    total_amount: z.number().nullable(),
    remaining_credit: z.number().nullable(),
    line_items: z.array(CreditNoteLineItem),
    currency: CurrencyEnum.nullable(),
    remote_created_at: z.string().datetime().nullable(),
    remote_updated_at: z.string().datetime().nullable(),
    payments: z.array(z.string()),
    remote_was_deleted: z.boolean(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedCreditNoteList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(CreditNote),
  })
  .partial();
const ExpenseLine = z
  .object({
    remote_id: z.string().nullable(),
    item: z.string().uuid().nullable(),
    net_amount: z.number().nullable(),
    tracking_category: z.string().uuid().nullable(),
    tracking_categories: z.array(z.string()),
    company: z.string().uuid().nullable(),
    account: z.string().uuid().nullable(),
    contact: z.string().uuid().nullable(),
    description: z.string().nullable(),
  })
  .partial();
const Expense = z
  .object({
    transaction_date: z.string().datetime().nullable(),
    remote_created_at: z.string().datetime().nullable(),
    account: z.string().uuid().nullable(),
    contact: z.string().uuid().nullable(),
    total_amount: z.number().nullable(),
    currency: CurrencyEnum.nullable(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
      .nullable(),
    company: z.string().uuid().nullable(),
    memo: z.string().nullable(),
    lines: z.array(ExpenseLine),
    remote_was_deleted: z.boolean(),
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedExpenseList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(Expense),
  })
  .partial();
const ExpenseLineRequest = z
  .object({
    remote_id: z.string().nullable(),
    item: z.string().uuid().nullable(),
    net_amount: z.number().nullable(),
    tracking_category: z.string().uuid().nullable(),
    tracking_categories: z.array(z.string()),
    company: z.string().uuid().nullable(),
    account: z.string().uuid().nullable(),
    contact: z.string().uuid().nullable(),
    description: z.string().nullable(),
    integration_params: z.object({}).partial().passthrough().nullable(),
    linked_account_params: z.object({}).partial().passthrough().nullable(),
  })
  .partial();
const ExpenseRequest = z
  .object({
    transaction_date: z.string().datetime().nullable(),
    account: z.string().uuid().nullable(),
    contact: z.string().uuid().nullable(),
    total_amount: z.number().nullable(),
    currency: CurrencyEnum.nullable(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
      .nullable(),
    company: z.string().uuid().nullable(),
    memo: z.string().nullable(),
    lines: z.array(ExpenseLineRequest),
    integration_params: z.object({}).partial().passthrough().nullable(),
    linked_account_params: z.object({}).partial().passthrough().nullable(),
  })
  .partial();
const ExpenseEndpointRequest = z.object({ model: ExpenseRequest });
const ExpenseResponse = z.object({
  model: Expense,
  warnings: z.array(WarningValidationProblem),
  errors: z.array(ErrorValidationProblem),
  logs: z.array(DebugModeLog).optional(),
});
const GenerateRemoteKeyRequest = z.object({ name: z.string().min(1) });
const RemoteKey = z.object({ name: z.string(), key: z.string() });
const IncomeStatement = z
  .object({
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    name: z.string().nullable(),
    currency: CurrencyEnum.nullable(),
    company: z.string().uuid().nullable(),
    start_period: z.string().datetime().nullable(),
    end_period: z.string().datetime().nullable(),
    income: z.array(ReportItem),
    cost_of_sales: z.array(ReportItem),
    gross_profit: z.number().nullable(),
    operating_expenses: z.array(ReportItem),
    net_operating_income: z.number().nullable(),
    non_operating_expenses: z.array(ReportItem),
    net_income: z.number().nullable(),
    remote_was_deleted: z.boolean(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedIncomeStatementList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(IncomeStatement),
  })
  .partial();
const InvoiceTypeEnum = z.enum(["ACCOUNTS_RECEIVABLE", "ACCOUNTS_PAYABLE"]);
const InvoiceLineItem = z
  .object({
    remote_id: z.string().nullable(),
    description: z.string().nullable(),
    unit_price: z.number().nullable(),
    quantity: z.number().nullable(),
    total_amount: z.number().nullable(),
    currency: CurrencyEnum.nullable(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
      .nullable(),
    item: z.string().uuid().nullable(),
    account: z.string().uuid().nullable(),
    tracking_category: z.string().uuid().nullable(),
    tracking_categories: z.array(z.string()),
    company: z.string().uuid().nullable(),
    id: z.string().uuid(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
  })
  .partial();
const Invoice = z
  .object({
    type: InvoiceTypeEnum.nullable(),
    contact: z.string().uuid().nullable(),
    number: z.string().nullable(),
    issue_date: z.string().datetime().nullable(),
    due_date: z.string().datetime().nullable(),
    paid_on_date: z.string().datetime().nullable(),
    memo: z.string().nullable(),
    company: z.string().uuid().nullable(),
    currency: CurrencyEnum.nullable(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
      .nullable(),
    total_discount: z.number().nullable(),
    sub_total: z.number().nullable(),
    total_tax_amount: z.number().nullable(),
    total_amount: z.number().nullable(),
    balance: z.number().nullable(),
    remote_updated_at: z.string().datetime().nullable(),
    payments: z.array(z.string()),
    line_items: z.array(InvoiceLineItem),
    remote_was_deleted: z.boolean(),
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedInvoiceList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(Invoice),
  })
  .partial();
const InvoiceLineItemRequest = z
  .object({
    remote_id: z.string().nullable(),
    description: z.string().nullable(),
    unit_price: z.number().nullable(),
    quantity: z.number().nullable(),
    total_amount: z.number().nullable(),
    currency: CurrencyEnum.nullable(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
      .nullable(),
    item: z.string().uuid().nullable(),
    account: z.string().uuid().nullable(),
    tracking_category: z.string().uuid().nullable(),
    tracking_categories: z.array(z.string()),
    company: z.string().uuid().nullable(),
    integration_params: z.object({}).partial().passthrough().nullable(),
    linked_account_params: z.object({}).partial().passthrough().nullable(),
  })
  .partial();
const InvoiceRequest = z
  .object({
    type: InvoiceTypeEnum.nullable(),
    contact: z.string().uuid().nullable(),
    number: z.string().nullable(),
    issue_date: z.string().datetime().nullable(),
    due_date: z.string().datetime().nullable(),
    paid_on_date: z.string().datetime().nullable(),
    memo: z.string().nullable(),
    company: z.string().uuid().nullable(),
    currency: CurrencyEnum.nullable(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
      .nullable(),
    total_discount: z.number().nullable(),
    sub_total: z.number().nullable(),
    total_tax_amount: z.number().nullable(),
    total_amount: z.number().nullable(),
    balance: z.number().nullable(),
    payments: z.array(z.string()),
    line_items: z.array(InvoiceLineItemRequest),
    integration_params: z.object({}).partial().passthrough().nullable(),
    linked_account_params: z.object({}).partial().passthrough().nullable(),
  })
  .partial();
const InvoiceEndpointRequest = z.object({ model: InvoiceRequest });
const InvoiceResponse = z.object({
  model: Invoice,
  warnings: z.array(WarningValidationProblem),
  errors: z.array(ErrorValidationProblem),
  logs: z.array(DebugModeLog).optional(),
});
const IssueStatusEnum = z.enum(["ONGOING", "RESOLVED"]);
const Issue = z.object({
  id: z.string().uuid().optional(),
  status: IssueStatusEnum.optional(),
  error_description: z.string(),
  end_user: z.object({}).partial().passthrough().optional(),
  first_incident_time: z.string().datetime().nullish(),
  last_incident_time: z.string().datetime().nullish(),
  is_muted: z.boolean().optional(),
  error_details: z.array(z.string()).optional(),
});
const PaginatedIssueList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(Issue),
  })
  .partial();
const Item = z
  .object({
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    name: z.string().nullable(),
    status: Status7d1Enum.nullable(),
    unit_price: z.number().nullable(),
    purchase_price: z.number().nullable(),
    purchase_account: z.string().uuid().nullable(),
    sales_account: z.string().uuid().nullable(),
    company: z.string().uuid().nullable(),
    remote_updated_at: z.string().datetime().nullable(),
    remote_was_deleted: z.boolean(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedItemList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(Item),
  })
  .partial();
const JournalLine = z
  .object({
    remote_id: z.string().nullable(),
    account: z.string().uuid().nullable(),
    net_amount: z.number().nullable(),
    tracking_category: z.string().uuid().nullable(),
    tracking_categories: z.array(z.string()),
    contact: z.string().uuid().nullable(),
    description: z.string().nullable(),
  })
  .partial();
const PostingStatusEnum = z.enum(["UNPOSTED", "POSTED"]);
const JournalEntry = z
  .object({
    transaction_date: z.string().datetime().nullable(),
    remote_created_at: z.string().datetime().nullable(),
    remote_updated_at: z.string().datetime().nullable(),
    payments: z.array(z.string()),
    memo: z.string().nullable(),
    currency: CurrencyEnum.nullable(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
      .nullable(),
    company: z.string().uuid().nullable(),
    lines: z.array(JournalLine),
    remote_was_deleted: z.boolean(),
    posting_status: PostingStatusEnum.nullable(),
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedJournalEntryList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(JournalEntry),
  })
  .partial();
const JournalLineRequest = z
  .object({
    remote_id: z.string().nullable(),
    account: z.string().uuid().nullable(),
    net_amount: z.number().nullable(),
    tracking_category: z.string().uuid().nullable(),
    tracking_categories: z.array(z.string()),
    contact: z.string().uuid().nullable(),
    description: z.string().nullable(),
    integration_params: z.object({}).partial().passthrough().nullable(),
    linked_account_params: z.object({}).partial().passthrough().nullable(),
  })
  .partial();
const JournalEntryRequest = z
  .object({
    transaction_date: z.string().datetime().nullable(),
    payments: z.array(z.string()),
    memo: z.string().nullable(),
    currency: CurrencyEnum.nullable(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
      .nullable(),
    company: z.string().uuid().nullable(),
    lines: z.array(JournalLineRequest),
    posting_status: PostingStatusEnum.nullable(),
    integration_params: z.object({}).partial().passthrough().nullable(),
    linked_account_params: z.object({}).partial().passthrough().nullable(),
  })
  .partial();
const JournalEntryEndpointRequest = z.object({ model: JournalEntryRequest });
const JournalEntryResponse = z.object({
  model: JournalEntry,
  warnings: z.array(WarningValidationProblem),
  errors: z.array(ErrorValidationProblem),
  logs: z.array(DebugModeLog).optional(),
});
const CommonModelScopesBodyRequest = z.object({
  model_id: z.string().min(1),
  enabled_actions: z.array(EnabledActionsEnum),
  disabled_fields: z.array(z.string()),
});
const EndUserDetailsRequest = z.object({
  end_user_email_address: z.string().min(1).max(100),
  end_user_organization_name: z.string().min(1).max(100),
  end_user_origin_id: z.string().min(1).max(100),
  categories: z.array(CategoriesEnum),
  integration: z.string().min(1).nullish(),
  link_expiry_mins: z.number().int().gte(30).lte(10080).optional().default(30),
  should_create_magic_link_url: z.boolean().nullish(),
  common_models: z.array(CommonModelScopesBodyRequest).nullish(),
});
const LinkToken = z.object({
  link_token: z.string(),
  integration_name: z.string().optional(),
  magic_link_url: z.string().optional(),
});
const AccountDetailsAndActionsStatusEnum = z.enum([
  "COMPLETE",
  "INCOMPLETE",
  "RELINK_NEEDED",
]);
const AccountDetailsAndActionsIntegration = z.object({
  name: z.string(),
  categories: z.array(CategoriesEnum),
  image: z.string().optional(),
  square_image: z.string().optional(),
  color: z.string(),
  slug: z.string(),
  passthrough_available: z.boolean(),
  available_model_operations: z.array(ModelOperation).optional(),
});
const AccountDetailsAndActions = z.object({
  id: z.string(),
  category: CategoryEnum.optional(),
  status: AccountDetailsAndActionsStatusEnum,
  status_detail: z.string().optional(),
  end_user_origin_id: z.string().optional(),
  end_user_organization_name: z.string(),
  end_user_email_address: z.string(),
  webhook_listener_url: z.string(),
  is_duplicate: z.boolean().nullish(),
  integration: AccountDetailsAndActionsIntegration.optional(),
});
const PaginatedAccountDetailsAndActionsList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(AccountDetailsAndActions),
  })
  .partial();
const MethodEnum = z.enum([
  "GET",
  "OPTIONS",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);
const EncodingEnum = z.enum(["RAW", "BASE64", "GZIP_BASE64"]);
const MultipartFormFieldRequest = z.object({
  name: z.string().min(1),
  data: z.string().min(1),
  encoding: EncodingEnum.nullish().default("RAW"),
  file_name: z.string().min(1).nullish(),
  content_type: z.string().min(1).nullish(),
});
const RequestFormatEnum = z.enum(["JSON", "XML", "MULTIPART"]);
const DataPassthroughRequest = z.object({
  method: MethodEnum,
  path: z.string().min(1),
  base_url_override: z.string().min(1).nullish(),
  data: z.string().min(1).nullish(),
  multipart_form_data: z.array(MultipartFormFieldRequest).nullish(),
  headers: z.object({}).partial().passthrough().nullish(),
  request_format: RequestFormatEnum.nullish(),
  normalize_response: z.boolean().optional(),
});
const ResponseTypeEnum = z.enum(["JSON", "BASE64_GZIP"]);
const RemoteResponse = z.object({
  method: z.string(),
  path: z.string(),
  status: z.number().int(),
  response: z.unknown(),
  response_headers: z.object({}).partial().passthrough().optional(),
  response_type: ResponseTypeEnum.optional(),
  headers: z.object({}).partial().passthrough().optional(),
});
const Payment = z
  .object({
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    transaction_date: z.string().datetime().nullable(),
    contact: z.string().uuid().nullable(),
    account: z.string().uuid().nullable(),
    currency: CurrencyEnum.nullable(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
      .nullable(),
    company: z.string().uuid().nullable(),
    total_amount: z.number().nullable(),
    remote_updated_at: z.string().datetime().nullable(),
    remote_was_deleted: z.boolean(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedPaymentList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(Payment),
  })
  .partial();
const PaymentRequest = z
  .object({
    transaction_date: z.string().datetime().nullable(),
    contact: z.string().uuid().nullable(),
    account: z.string().uuid().nullable(),
    currency: CurrencyEnum.nullable(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
      .nullable(),
    company: z.string().uuid().nullable(),
    total_amount: z.number().nullable(),
    integration_params: z.object({}).partial().passthrough().nullable(),
    linked_account_params: z.object({}).partial().passthrough().nullable(),
  })
  .partial();
const PaymentEndpointRequest = z.object({ model: PaymentRequest });
const PaymentResponse = z.object({
  model: Payment,
  warnings: z.array(WarningValidationProblem),
  errors: z.array(ErrorValidationProblem),
  logs: z.array(DebugModeLog).optional(),
});
const PurchaseOrderStatusEnum = z.enum([
  "DRAFT",
  "SUBMITTED",
  "AUTHORIZED",
  "BILLED",
  "DELETED",
]);
const PurchaseOrderLineItem = z.object({
  remote_id: z.string().nullish(),
  description: z.string().nullish(),
  unit_price: z.number().nullish(),
  quantity: z.number().nullish(),
  item: z.string().uuid().nullish(),
  account: z.string().uuid().nullish(),
  tracking_category: z.string().uuid().nullish(),
  tracking_categories: z.array(z.string()),
  tax_amount: z
    .string()
    .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
    .nullish(),
  total_line_amount: z
    .string()
    .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
    .nullish(),
  currency: CurrencyEnum.nullish(),
  exchange_rate: z
    .string()
    .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
    .nullish(),
  company: z.string().uuid().nullish(),
});
const PurchaseOrder = z
  .object({
    status: PurchaseOrderStatusEnum.nullable(),
    issue_date: z.string().datetime().nullable(),
    delivery_date: z.string().datetime().nullable(),
    delivery_address: z.string().uuid().nullable(),
    customer: z.string().uuid().nullable(),
    vendor: z.string().uuid().nullable(),
    memo: z.string().nullable(),
    company: z.string().uuid().nullable(),
    total_amount: z.number().nullable(),
    currency: CurrencyEnum.nullable(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
      .nullable(),
    line_items: z.array(PurchaseOrderLineItem),
    remote_created_at: z.string().datetime().nullable(),
    remote_updated_at: z.string().datetime().nullable(),
    remote_was_deleted: z.boolean(),
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedPurchaseOrderList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(PurchaseOrder),
  })
  .partial();
const PurchaseOrderLineItemRequest = z.object({
  remote_id: z.string().nullish(),
  description: z.string().nullish(),
  unit_price: z.number().nullish(),
  quantity: z.number().nullish(),
  item: z.string().uuid().nullish(),
  account: z.string().uuid().nullish(),
  tracking_category: z.string().uuid().nullish(),
  tracking_categories: z.array(z.string()),
  tax_amount: z
    .string()
    .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
    .nullish(),
  total_line_amount: z
    .string()
    .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
    .nullish(),
  currency: CurrencyEnum.nullish(),
  exchange_rate: z
    .string()
    .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
    .nullish(),
  company: z.string().uuid().nullish(),
  integration_params: z.object({}).partial().passthrough().nullish(),
  linked_account_params: z.object({}).partial().passthrough().nullish(),
});
const PurchaseOrderRequest = z
  .object({
    status: PurchaseOrderStatusEnum.nullable(),
    issue_date: z.string().datetime().nullable(),
    delivery_date: z.string().datetime().nullable(),
    delivery_address: z.string().uuid().nullable(),
    customer: z.string().uuid().nullable(),
    vendor: z.string().uuid().nullable(),
    memo: z.string().nullable(),
    company: z.string().uuid().nullable(),
    total_amount: z.number().nullable(),
    currency: CurrencyEnum.nullable(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
      .nullable(),
    line_items: z.array(PurchaseOrderLineItemRequest),
    integration_params: z.object({}).partial().passthrough().nullable(),
    linked_account_params: z.object({}).partial().passthrough().nullable(),
  })
  .partial();
const PurchaseOrderEndpointRequest = z.object({ model: PurchaseOrderRequest });
const PurchaseOrderResponse = z.object({
  model: PurchaseOrder,
  warnings: z.array(WarningValidationProblem),
  errors: z.array(ErrorValidationProblem),
  logs: z.array(DebugModeLog).optional(),
});
const RemoteKeyForRegenerationRequest = z.object({ name: z.string().min(1) });
const LinkedAccountCondition = z.object({
  condition_schema_id: z.string().uuid(),
  common_model: z.string().optional(),
  native_name: z.string().nullable(),
  operator: z.string(),
  value: z.unknown().optional(),
  field_name: z.string().nullable(),
});
const LinkedAccountSelectiveSyncConfiguration = z
  .object({ linked_account_conditions: z.array(LinkedAccountCondition) })
  .partial();
const LinkedAccountConditionRequest = z.object({
  condition_schema_id: z.string().uuid(),
  operator: z.string().min(1),
  value: z.unknown(),
});
const LinkedAccountSelectiveSyncConfigurationRequest = z.object({
  linked_account_conditions: z.array(LinkedAccountConditionRequest),
});
const LinkedAccountSelectiveSyncConfigurationListRequest = z.object({
  sync_configurations: z.array(LinkedAccountSelectiveSyncConfigurationRequest),
});
const ConditionTypeEnum = z.enum([
  "BOOLEAN",
  "DATE",
  "DATE_TIME",
  "INTEGER",
  "FLOAT",
  "STRING",
  "LIST_OF_STRINGS",
]);
const OperatorSchema = z
  .object({ operator: z.string(), is_unique: z.boolean() })
  .partial();
const ConditionSchema = z.object({
  id: z.string().uuid(),
  common_model: z.string().optional(),
  native_name: z.string().nullable(),
  field_name: z.string().nullable(),
  is_unique: z.boolean().optional(),
  condition_type: ConditionTypeEnum,
  operators: z.array(OperatorSchema),
});
const PaginatedConditionSchemaList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(ConditionSchema),
  })
  .partial();
const SyncStatusStatusEnum = z.enum([
  "SYNCING",
  "DONE",
  "FAILED",
  "DISABLED",
  "PAUSED",
]);
const SelectiveSyncConfigurationsUsageEnum = z.enum([
  "IN_NEXT_SYNC",
  "IN_LAST_SYNC",
]);
const SyncStatus = z.object({
  model_name: z.string(),
  model_id: z.string(),
  last_sync_start: z.string().datetime().optional(),
  next_sync_start: z.string().datetime().optional(),
  status: SyncStatusStatusEnum,
  is_initial_sync: z.boolean(),
  selective_sync_configurations_usage:
    SelectiveSyncConfigurationsUsageEnum.optional(),
});
const PaginatedSyncStatusList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(SyncStatus),
  })
  .partial();
const TaxRate = z
  .object({
    description: z.string().nullable(),
    total_tax_rate: z.number().nullable(),
    effective_tax_rate: z.number().nullable(),
    company: z.string().uuid().nullable(),
    remote_was_deleted: z.boolean(),
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedTaxRateList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(TaxRate),
  })
  .partial();
const CategoryTypeEnum = z.enum(["CLASS", "DEPARTMENT"]);
const TrackingCategory = z
  .object({
    name: z.string().nullable(),
    status: Status7d1Enum.nullable(),
    category_type: CategoryTypeEnum.nullable(),
    parent_category: z.string().uuid().nullable(),
    company: z.string().uuid().nullable(),
    remote_was_deleted: z.boolean(),
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedTrackingCategoryList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(TrackingCategory),
  })
  .partial();
const TransactionLineItem = z.object({
  remote_id: z.string().nullish(),
  memo: z.string().nullish(),
  unit_price: z
    .string()
    .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
    .nullish(),
  quantity: z
    .string()
    .regex(/^-?\d{0,24}(?:\.\d{0,8})?$/)
    .nullish(),
  item: z.string().uuid().nullish(),
  account: z.string().uuid().nullish(),
  tracking_category: z.string().uuid().nullish(),
  tracking_categories: z.array(z.string()),
  total_line_amount: z
    .string()
    .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
    .nullish(),
  tax_rate: z.string().uuid().nullish(),
  currency: CurrencyEnum.nullish(),
  exchange_rate: z
    .string()
    .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
    .nullish(),
  company: z.string().uuid().nullish(),
});
const Transaction = z
  .object({
    transaction_type: z.string().nullable(),
    number: z.string().nullable(),
    transaction_date: z.string().datetime().nullable(),
    account: z.string().uuid().nullable(),
    contact: z.string().uuid().nullable(),
    total_amount: z
      .string()
      .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
      .nullable(),
    currency: CurrencyEnum.nullable(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
      .nullable(),
    company: z.string().uuid().nullable(),
    line_items: z.array(TransactionLineItem),
    remote_was_deleted: z.boolean(),
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedTransactionList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(Transaction),
  })
  .partial();
const VendorCreditLine = z.object({
  remote_id: z.string().nullish(),
  net_amount: z.number().nullish(),
  tracking_category: z.string().uuid().nullish(),
  tracking_categories: z.array(z.string()),
  description: z.string().nullish(),
  account: z.string().uuid().nullish(),
  company: z.string().uuid().nullish(),
});
const VendorCredit = z
  .object({
    id: z.string().uuid(),
    remote_id: z.string().nullable(),
    number: z.string().nullable(),
    transaction_date: z.string().datetime().nullable(),
    vendor: z.string().uuid().nullable(),
    total_amount: z.number().nullable(),
    currency: CurrencyEnum.nullable(),
    exchange_rate: z
      .string()
      .regex(/^-?\d{0,32}(?:\.\d{0,16})?$/)
      .nullable(),
    company: z.string().uuid().nullable(),
    lines: z.array(VendorCreditLine),
    remote_was_deleted: z.boolean(),
    field_mappings: z.object({}).partial().passthrough().nullable(),
    remote_data: z.array(RemoteData).nullable(),
  })
  .partial();
const PaginatedVendorCreditList = z
  .object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(VendorCredit),
  })
  .partial();
const WebhookReceiver = z.object({
  event: z.string(),
  is_active: z.boolean(),
  key: z.string().optional(),
});
const WebhookReceiverRequest = z.object({
  event: z.string().min(1),
  is_active: z.boolean(),
  key: z.string().min(1).optional(),
});

export const schemas = {
  CategoryEnum,
  AccountDetails,
  CategoriesEnum,
  AccountIntegration,
  AccountToken,
  ClassificationEnum,
  AccountStatusEnum,
  CurrencyEnum,
  RemoteData,
  Account,
  PaginatedAccountList,
  AccountRequest,
  AccountEndpointRequest,
  ValidationProblemSource,
  WarningValidationProblem,
  ErrorValidationProblem,
  DebugModelLogSummary,
  DebugModeLog,
  AccountResponse,
  LinkedAccountStatus,
  MetaResponse,
  AddressTypeEnum,
  CountryEnum,
  Address,
  AccountingAttachment,
  PaginatedAccountingAttachmentList,
  AccountingAttachmentRequest,
  AccountingAttachmentEndpointRequest,
  AccountingAttachmentResponse,
  ModelOperation,
  AvailableActions,
  ReportItem,
  BalanceSheet,
  PaginatedBalanceSheetList,
  CashFlowStatement,
  PaginatedCashFlowStatementList,
  CommonModelScopesDisabledModelsEnabledActionsEnum,
  CommonModelScopesDisabledModels,
  CommonModelScopeData,
  CommonModelScopes,
  EnabledActionsEnum,
  CommonModelScopesPostInnerDeserializerRequest,
  CommonModelScopesUpdateSerializer,
  AccountingPhoneNumber,
  CompanyInfo,
  PaginatedCompanyInfoList,
  Status7d1Enum,
  Contact,
  PaginatedContactList,
  AccountingPhoneNumberRequest,
  ContactRequest,
  ContactEndpointRequest,
  ContactResponse,
  CreditNoteStatusEnum,
  CreditNoteLineItem,
  CreditNote,
  PaginatedCreditNoteList,
  ExpenseLine,
  Expense,
  PaginatedExpenseList,
  ExpenseLineRequest,
  ExpenseRequest,
  ExpenseEndpointRequest,
  ExpenseResponse,
  GenerateRemoteKeyRequest,
  RemoteKey,
  IncomeStatement,
  PaginatedIncomeStatementList,
  InvoiceTypeEnum,
  InvoiceLineItem,
  Invoice,
  PaginatedInvoiceList,
  InvoiceLineItemRequest,
  InvoiceRequest,
  InvoiceEndpointRequest,
  InvoiceResponse,
  IssueStatusEnum,
  Issue,
  PaginatedIssueList,
  Item,
  PaginatedItemList,
  JournalLine,
  PostingStatusEnum,
  JournalEntry,
  PaginatedJournalEntryList,
  JournalLineRequest,
  JournalEntryRequest,
  JournalEntryEndpointRequest,
  JournalEntryResponse,
  CommonModelScopesBodyRequest,
  EndUserDetailsRequest,
  LinkToken,
  AccountDetailsAndActionsStatusEnum,
  AccountDetailsAndActionsIntegration,
  AccountDetailsAndActions,
  PaginatedAccountDetailsAndActionsList,
  MethodEnum,
  EncodingEnum,
  MultipartFormFieldRequest,
  RequestFormatEnum,
  DataPassthroughRequest,
  ResponseTypeEnum,
  RemoteResponse,
  Payment,
  PaginatedPaymentList,
  PaymentRequest,
  PaymentEndpointRequest,
  PaymentResponse,
  PurchaseOrderStatusEnum,
  PurchaseOrderLineItem,
  PurchaseOrder,
  PaginatedPurchaseOrderList,
  PurchaseOrderLineItemRequest,
  PurchaseOrderRequest,
  PurchaseOrderEndpointRequest,
  PurchaseOrderResponse,
  RemoteKeyForRegenerationRequest,
  LinkedAccountCondition,
  LinkedAccountSelectiveSyncConfiguration,
  LinkedAccountConditionRequest,
  LinkedAccountSelectiveSyncConfigurationRequest,
  LinkedAccountSelectiveSyncConfigurationListRequest,
  ConditionTypeEnum,
  OperatorSchema,
  ConditionSchema,
  PaginatedConditionSchemaList,
  SyncStatusStatusEnum,
  SelectiveSyncConfigurationsUsageEnum,
  SyncStatus,
  PaginatedSyncStatusList,
  TaxRate,
  PaginatedTaxRateList,
  CategoryTypeEnum,
  TrackingCategory,
  PaginatedTrackingCategoryList,
  TransactionLineItem,
  Transaction,
  PaginatedTransactionList,
  VendorCreditLine,
  VendorCredit,
  PaginatedVendorCreditList,
  WebhookReceiver,
  WebhookReceiverRequest,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/account-details",
    description: `Get details for a linked account.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: AccountDetails,
  },
  {
    method: "get",
    path: "/account-token/:public_token",
    description: `Returns the account token for the end user with the provided public token.`,
    requestFormat: "json",
    parameters: [
      {
        name: "public_token",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: AccountToken,
  },
  {
    method: "get",
    path: "/accounts",
    description: `Returns a list of &#x60;Account&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z.literal("company").optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_fields",
        type: "Query",
        schema: z
          .enum(["classification", "classification,status", "status"])
          .optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
      {
        name: "show_enum_origins",
        type: "Query",
        schema: z
          .enum(["classification", "classification,status", "status"])
          .optional(),
      },
    ],
    response: PaginatedAccountList,
  },
  {
    method: "post",
    path: "/accounts",
    description: `Creates an &#x60;Account&#x60; object with the given values.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AccountEndpointRequest,
      },
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "is_debug_mode",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "run_async",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: AccountResponse,
  },
  {
    method: "get",
    path: "/accounts/:id",
    description: `Returns an &#x60;Account&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z.literal("company").optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "remote_fields",
        type: "Query",
        schema: z
          .enum(["classification", "classification,status", "status"])
          .optional(),
      },
      {
        name: "show_enum_origins",
        type: "Query",
        schema: z
          .enum(["classification", "classification,status", "status"])
          .optional(),
      },
    ],
    response: Account,
  },
  {
    method: "get",
    path: "/accounts/meta/post",
    description: `Returns metadata for &#x60;Account&#x60; POSTs.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: MetaResponse,
  },
  {
    method: "get",
    path: "/addresses/:id",
    description: `Returns an &#x60;Address&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "remote_fields",
        type: "Query",
        schema: z.literal("type").optional(),
      },
      {
        name: "show_enum_origins",
        type: "Query",
        schema: z.literal("type").optional(),
      },
    ],
    response: Address,
  },
  {
    method: "get",
    path: "/attachments",
    description: `Returns a list of &#x60;AccountingAttachment&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: PaginatedAccountingAttachmentList,
  },
  {
    method: "post",
    path: "/attachments",
    description: `Creates an &#x60;AccountingAttachment&#x60; object with the given values.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AccountingAttachmentEndpointRequest,
      },
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "is_debug_mode",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "run_async",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: AccountingAttachmentResponse,
  },
  {
    method: "get",
    path: "/attachments/:id",
    description: `Returns an &#x60;AccountingAttachment&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: AccountingAttachment,
  },
  {
    method: "get",
    path: "/attachments/meta/post",
    description: `Returns metadata for &#x60;AccountingAttachment&#x60; POSTs.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: MetaResponse,
  },
  {
    method: "get",
    path: "/available-actions",
    description: `Returns a list of models and actions available for an account.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: AvailableActions,
  },
  {
    method: "get",
    path: "/balance-sheets",
    description: `Returns a list of &#x60;BalanceSheet&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z.literal("company").optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: PaginatedBalanceSheetList,
  },
  {
    method: "get",
    path: "/balance-sheets/:id",
    description: `Returns a &#x60;BalanceSheet&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z.literal("company").optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: BalanceSheet,
  },
  {
    method: "get",
    path: "/cash-flow-statements",
    description: `Returns a list of &#x60;CashFlowStatement&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z.literal("company").optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: PaginatedCashFlowStatementList,
  },
  {
    method: "get",
    path: "/cash-flow-statements/:id",
    description: `Returns a &#x60;CashFlowStatement&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z.literal("company").optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: CashFlowStatement,
  },
  {
    method: "get",
    path: "/common-model-scopes",
    description: `Fetch the configuration of what data is saved by Merge when syncing. Common model scopes are set as a default across all linked accounts, but can be updated to have greater granularity per account.`,
    requestFormat: "json",
    parameters: [
      {
        name: "linked_account_id",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: CommonModelScopes,
  },
  {
    method: "post",
    path: "/common-model-scopes",
    description: `Update the configuration of what data is saved by Merge when syncing. Common model scopes are set as a default across all linked accounts, but can be updated to have greater granularity per account.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CommonModelScopesUpdateSerializer,
      },
      {
        name: "linked_account_id",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: CommonModelScopes,
  },
  {
    method: "get",
    path: "/company-info",
    description: `Returns a list of &#x60;CompanyInfo&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum(["addresses", "addresses,phone_numbers", "phone_numbers"])
          .optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: PaginatedCompanyInfoList,
  },
  {
    method: "get",
    path: "/company-info/:id",
    description: `Returns a &#x60;CompanyInfo&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum(["addresses", "addresses,phone_numbers", "phone_numbers"])
          .optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: CompanyInfo,
  },
  {
    method: "get",
    path: "/contacts",
    description: `Returns a list of &#x60;Contact&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "addresses",
            "addresses,company",
            "addresses,phone_numbers",
            "addresses,phone_numbers,company",
            "company",
            "phone_numbers",
            "phone_numbers,company",
          ])
          .optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_fields",
        type: "Query",
        schema: z.literal("status").optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
      {
        name: "show_enum_origins",
        type: "Query",
        schema: z.literal("status").optional(),
      },
    ],
    response: PaginatedContactList,
  },
  {
    method: "post",
    path: "/contacts",
    description: `Creates a &#x60;Contact&#x60; object with the given values.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ContactEndpointRequest,
      },
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "is_debug_mode",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "run_async",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: ContactResponse,
  },
  {
    method: "get",
    path: "/contacts/:id",
    description: `Returns a &#x60;Contact&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "addresses",
            "addresses,company",
            "addresses,phone_numbers",
            "addresses,phone_numbers,company",
            "company",
            "phone_numbers",
            "phone_numbers,company",
          ])
          .optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "remote_fields",
        type: "Query",
        schema: z.literal("status").optional(),
      },
      {
        name: "show_enum_origins",
        type: "Query",
        schema: z.literal("status").optional(),
      },
    ],
    response: Contact,
  },
  {
    method: "get",
    path: "/contacts/meta/post",
    description: `Returns metadata for &#x60;Contact&#x60; POSTs.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: MetaResponse,
  },
  {
    method: "get",
    path: "/credit-notes",
    description: `Returns a list of &#x60;CreditNote&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum(["line_items", "payments", "payments,line_items"])
          .optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_fields",
        type: "Query",
        schema: z.enum(["status", "status,type", "type"]).optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
      {
        name: "show_enum_origins",
        type: "Query",
        schema: z.enum(["status", "status,type", "type"]).optional(),
      },
      {
        name: "transaction_date_after",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
      {
        name: "transaction_date_before",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
    ],
    response: PaginatedCreditNoteList,
  },
  {
    method: "get",
    path: "/credit-notes/:id",
    description: `Returns a &#x60;CreditNote&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum(["line_items", "payments", "payments,line_items"])
          .optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "remote_fields",
        type: "Query",
        schema: z.enum(["status", "status,type", "type"]).optional(),
      },
      {
        name: "show_enum_origins",
        type: "Query",
        schema: z.enum(["status", "status,type", "type"]).optional(),
      },
    ],
    response: CreditNote,
  },
  {
    method: "post",
    path: "/delete-account",
    description: `Delete a linked account.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/expenses",
    description: `Returns a list of &#x60;Expense&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "account",
            "account,company",
            "account,contact",
            "account,contact,company",
            "company",
            "contact",
            "contact,company",
          ])
          .optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
      {
        name: "transaction_date_after",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
      {
        name: "transaction_date_before",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
    ],
    response: PaginatedExpenseList,
  },
  {
    method: "post",
    path: "/expenses",
    description: `Creates an &#x60;Expense&#x60; object with the given values.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ExpenseEndpointRequest,
      },
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "is_debug_mode",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "run_async",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: ExpenseResponse,
  },
  {
    method: "get",
    path: "/expenses/:id",
    description: `Returns an &#x60;Expense&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "account",
            "account,company",
            "account,contact",
            "account,contact,company",
            "company",
            "contact",
            "contact,company",
          ])
          .optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: Expense,
  },
  {
    method: "get",
    path: "/expenses/meta/post",
    description: `Returns metadata for &#x60;Expense&#x60; POSTs.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: MetaResponse,
  },
  {
    method: "post",
    path: "/generate-key",
    description: `Create a remote key.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ name: z.string().min(1) }),
      },
    ],
    response: RemoteKey,
  },
  {
    method: "get",
    path: "/income-statements",
    description: `Returns a list of &#x60;IncomeStatement&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z.literal("company").optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: PaginatedIncomeStatementList,
  },
  {
    method: "get",
    path: "/income-statements/:id",
    description: `Returns an &#x60;IncomeStatement&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z.literal("company").optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: IncomeStatement,
  },
  {
    method: "get",
    path: "/invoices",
    description: `Returns a list of &#x60;Invoice&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "contact_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "company",
            "contact",
            "contact,company",
            "line_items",
            "line_items,company",
            "line_items,contact",
            "line_items,contact,company",
            "payments",
            "payments,company",
            "payments,contact",
            "payments,contact,company",
            "payments,line_items",
            "payments,line_items,company",
            "payments,line_items,contact",
            "payments,line_items,contact,company",
          ])
          .optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "issue_date_after",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
      {
        name: "issue_date_before",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_fields",
        type: "Query",
        schema: z.literal("type").optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
      {
        name: "show_enum_origins",
        type: "Query",
        schema: z.literal("type").optional(),
      },
      {
        name: "type",
        type: "Query",
        schema: z.enum(["ACCOUNTS_PAYABLE", "ACCOUNTS_RECEIVABLE"]).nullish(),
      },
    ],
    response: PaginatedInvoiceList,
  },
  {
    method: "post",
    path: "/invoices",
    description: `Creates an &#x60;Invoice&#x60; object with the given values.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InvoiceEndpointRequest,
      },
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "is_debug_mode",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "run_async",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: InvoiceResponse,
  },
  {
    method: "get",
    path: "/invoices/:id",
    description: `Returns an &#x60;Invoice&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "company",
            "contact",
            "contact,company",
            "line_items",
            "line_items,company",
            "line_items,contact",
            "line_items,contact,company",
            "payments",
            "payments,company",
            "payments,contact",
            "payments,contact,company",
            "payments,line_items",
            "payments,line_items,company",
            "payments,line_items,contact",
            "payments,line_items,contact,company",
          ])
          .optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "remote_fields",
        type: "Query",
        schema: z.literal("type").optional(),
      },
      {
        name: "show_enum_origins",
        type: "Query",
        schema: z.literal("type").optional(),
      },
    ],
    response: Invoice,
  },
  {
    method: "get",
    path: "/invoices/meta/post",
    description: `Returns metadata for &#x60;Invoice&#x60; POSTs.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: MetaResponse,
  },
  {
    method: "get",
    path: "/issues",
    description: `Gets issues.`,
    requestFormat: "json",
    parameters: [
      {
        name: "account_token",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "end_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "end_user_organization_name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "first_incident_time_after",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
      {
        name: "first_incident_time_before",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
      {
        name: "include_muted",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "integration_name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "last_incident_time_after",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
      {
        name: "last_incident_time_before",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "start_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.enum(["ONGOING", "RESOLVED"]).optional(),
      },
    ],
    response: PaginatedIssueList,
  },
  {
    method: "get",
    path: "/issues/:id",
    description: `Get a specific issue.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: Issue,
  },
  {
    method: "get",
    path: "/items",
    description: `Returns a list of &#x60;Item&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "company",
            "purchase_account",
            "purchase_account,company",
            "purchase_account,sales_account",
            "purchase_account,sales_account,company",
            "sales_account",
            "sales_account,company",
          ])
          .optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_fields",
        type: "Query",
        schema: z.literal("status").optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
      {
        name: "show_enum_origins",
        type: "Query",
        schema: z.literal("status").optional(),
      },
    ],
    response: PaginatedItemList,
  },
  {
    method: "get",
    path: "/items/:id",
    description: `Returns an &#x60;Item&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "company",
            "purchase_account",
            "purchase_account,company",
            "purchase_account,sales_account",
            "purchase_account,sales_account,company",
            "sales_account",
            "sales_account,company",
          ])
          .optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "remote_fields",
        type: "Query",
        schema: z.literal("status").optional(),
      },
      {
        name: "show_enum_origins",
        type: "Query",
        schema: z.literal("status").optional(),
      },
    ],
    response: Item,
  },
  {
    method: "get",
    path: "/journal-entries",
    description: `Returns a list of &#x60;JournalEntry&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "company",
            "lines",
            "lines,company",
            "lines,payments",
            "lines,payments,company",
            "payments",
            "payments,company",
          ])
          .optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
      {
        name: "transaction_date_after",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
      {
        name: "transaction_date_before",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
    ],
    response: PaginatedJournalEntryList,
  },
  {
    method: "post",
    path: "/journal-entries",
    description: `Creates a &#x60;JournalEntry&#x60; object with the given values.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: JournalEntryEndpointRequest,
      },
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "is_debug_mode",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "run_async",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: JournalEntryResponse,
  },
  {
    method: "get",
    path: "/journal-entries/:id",
    description: `Returns a &#x60;JournalEntry&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "company",
            "lines",
            "lines,company",
            "lines,payments",
            "lines,payments,company",
            "payments",
            "payments,company",
          ])
          .optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: JournalEntry,
  },
  {
    method: "get",
    path: "/journal-entries/meta/post",
    description: `Returns metadata for &#x60;JournalEntry&#x60; POSTs.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: MetaResponse,
  },
  {
    method: "post",
    path: "/link-token",
    description: `Creates a link token to be used when linking a new end user.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: EndUserDetailsRequest,
      },
    ],
    response: LinkToken,
  },
  {
    method: "get",
    path: "/linked-accounts",
    description: `List linked accounts for your organization.`,
    requestFormat: "json",
    parameters: [
      {
        name: "category",
        type: "Query",
        schema: z
          .enum([
            "accounting",
            "ats",
            "crm",
            "filestorage",
            "hris",
            "mktg",
            "ticketing",
          ])
          .nullish(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "end_user_email_address",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "end_user_organization_name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "end_user_origin_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "end_user_origin_ids",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.string().uuid().optional(),
      },
      {
        name: "ids",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "include_duplicates",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "integration_name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "is_test_account",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedAccountDetailsAndActionsList,
  },
  {
    method: "post",
    path: "/passthrough",
    description: `Pull data from an endpoint not currently supported by Merge.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DataPassthroughRequest,
      },
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: RemoteResponse,
  },
  {
    method: "get",
    path: "/payments",
    description: `Returns a list of &#x60;Payment&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "account_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "contact_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "account",
            "account,company",
            "company",
            "contact",
            "contact,account",
            "contact,account,company",
            "contact,company",
          ])
          .optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
      {
        name: "transaction_date_after",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
      {
        name: "transaction_date_before",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
    ],
    response: PaginatedPaymentList,
  },
  {
    method: "post",
    path: "/payments",
    description: `Creates a &#x60;Payment&#x60; object with the given values.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PaymentEndpointRequest,
      },
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "is_debug_mode",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "run_async",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: PaymentResponse,
  },
  {
    method: "get",
    path: "/payments/:id",
    description: `Returns a &#x60;Payment&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "account",
            "account,company",
            "company",
            "contact",
            "contact,account",
            "contact,account,company",
            "contact,company",
          ])
          .optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: Payment,
  },
  {
    method: "get",
    path: "/payments/meta/post",
    description: `Returns metadata for &#x60;Payment&#x60; POSTs.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: MetaResponse,
  },
  {
    method: "get",
    path: "/phone-numbers/:id",
    description: `Returns an &#x60;AccountingPhoneNumber&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: AccountingPhoneNumber,
  },
  {
    method: "get",
    path: "/purchase-orders",
    description: `Returns a list of &#x60;PurchaseOrder&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "company",
            "delivery_address",
            "delivery_address,company",
            "delivery_address,vendor",
            "delivery_address,vendor,company",
            "line_items",
            "line_items,company",
            "line_items,delivery_address",
            "line_items,delivery_address,company",
            "line_items,delivery_address,vendor",
            "line_items,delivery_address,vendor,company",
            "line_items,vendor",
            "line_items,vendor,company",
            "vendor",
            "vendor,company",
          ])
          .optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "issue_date_after",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
      {
        name: "issue_date_before",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_fields",
        type: "Query",
        schema: z.literal("status").optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
      {
        name: "show_enum_origins",
        type: "Query",
        schema: z.literal("status").optional(),
      },
    ],
    response: PaginatedPurchaseOrderList,
  },
  {
    method: "post",
    path: "/purchase-orders",
    description: `Creates a &#x60;PurchaseOrder&#x60; object with the given values.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PurchaseOrderEndpointRequest,
      },
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "is_debug_mode",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "run_async",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: PurchaseOrderResponse,
  },
  {
    method: "get",
    path: "/purchase-orders/:id",
    description: `Returns a &#x60;PurchaseOrder&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "company",
            "delivery_address",
            "delivery_address,company",
            "delivery_address,vendor",
            "delivery_address,vendor,company",
            "line_items",
            "line_items,company",
            "line_items,delivery_address",
            "line_items,delivery_address,company",
            "line_items,delivery_address,vendor",
            "line_items,delivery_address,vendor,company",
            "line_items,vendor",
            "line_items,vendor,company",
            "vendor",
            "vendor,company",
          ])
          .optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "remote_fields",
        type: "Query",
        schema: z.literal("status").optional(),
      },
      {
        name: "show_enum_origins",
        type: "Query",
        schema: z.literal("status").optional(),
      },
    ],
    response: PurchaseOrder,
  },
  {
    method: "get",
    path: "/purchase-orders/meta/post",
    description: `Returns metadata for &#x60;PurchaseOrder&#x60; POSTs.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: MetaResponse,
  },
  {
    method: "post",
    path: "/regenerate-key",
    description: `Exchange remote keys.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ name: z.string().min(1) }),
      },
    ],
    response: RemoteKey,
  },
  {
    method: "get",
    path: "/selective-sync/configurations",
    description: `Get a linked account&#x27;s selective syncs.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: z.array(LinkedAccountSelectiveSyncConfiguration),
  },
  {
    method: "put",
    path: "/selective-sync/configurations",
    description: `Replace a linked account&#x27;s selective syncs.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LinkedAccountSelectiveSyncConfigurationListRequest,
      },
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: z.array(LinkedAccountSelectiveSyncConfiguration),
  },
  {
    method: "get",
    path: "/selective-sync/meta",
    description: `Get metadata for the conditions available to a linked account.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "common_model",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedConditionSchemaList,
  },
  {
    method: "get",
    path: "/sync-status",
    description: `Get syncing status. Possible values: &#x60;DISABLED&#x60;, &#x60;DONE&#x60;, &#x60;FAILED&#x60;, &#x60;PAUSED&#x60;, &#x60;SYNCING&#x60;`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedSyncStatusList,
  },
  {
    method: "post",
    path: "/sync-status/resync",
    description: `Force re-sync of all models. This is available for all organizations via the dashboard. Force re-sync is also available for monthly and quarterly sync frequency customers on the Core, Professional, or Enterprise plans.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: z.array(SyncStatus),
  },
  {
    method: "get",
    path: "/tax-rates",
    description: `Returns a list of &#x60;TaxRate&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z.literal("company").optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: PaginatedTaxRateList,
  },
  {
    method: "get",
    path: "/tax-rates/:id",
    description: `Returns a &#x60;TaxRate&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z.literal("company").optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: TaxRate,
  },
  {
    method: "get",
    path: "/tracking-categories",
    description: `Returns a list of &#x60;TrackingCategory&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z.literal("company").optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_fields",
        type: "Query",
        schema: z.literal("status").optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
      {
        name: "show_enum_origins",
        type: "Query",
        schema: z.literal("status").optional(),
      },
    ],
    response: PaginatedTrackingCategoryList,
  },
  {
    method: "get",
    path: "/tracking-categories/:id",
    description: `Returns a &#x60;TrackingCategory&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z.literal("company").optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "remote_fields",
        type: "Query",
        schema: z.literal("status").optional(),
      },
      {
        name: "show_enum_origins",
        type: "Query",
        schema: z.literal("status").optional(),
      },
    ],
    response: TrackingCategory,
  },
  {
    method: "get",
    path: "/transactions",
    description: `Returns a list of &#x60;Transaction&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "account",
            "contact",
            "contact,account",
            "line_items",
            "line_items,account",
            "line_items,contact",
            "line_items,contact,account",
          ])
          .optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
      {
        name: "transaction_date_after",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
      {
        name: "transaction_date_before",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
    ],
    response: PaginatedTransactionList,
  },
  {
    method: "get",
    path: "/transactions/:id",
    description: `Returns a &#x60;Transaction&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "account",
            "contact",
            "contact,account",
            "line_items",
            "line_items,account",
            "line_items,contact",
            "line_items,contact,account",
          ])
          .optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: Transaction,
  },
  {
    method: "get",
    path: "/vendor-credits",
    description: `Returns a list of &#x60;VendorCredit&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "company_id",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "created_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "created_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "company",
            "lines",
            "lines,company",
            "lines,vendor",
            "lines,vendor,company",
            "vendor",
            "vendor,company",
          ])
          .optional(),
      },
      {
        name: "include_deleted_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "modified_after",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "modified_before",
        type: "Query",
        schema: z.string().datetime().optional(),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "remote_id",
        type: "Query",
        schema: z.string().nullish(),
      },
      {
        name: "transaction_date_after",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
      {
        name: "transaction_date_before",
        type: "Query",
        schema: z.string().datetime().nullish(),
      },
    ],
    response: PaginatedVendorCreditList,
  },
  {
    method: "get",
    path: "/vendor-credits/:id",
    description: `Returns a &#x60;VendorCredit&#x60; object with the given &#x60;id&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
      {
        name: "expand",
        type: "Query",
        schema: z
          .enum([
            "company",
            "lines",
            "lines,company",
            "lines,vendor",
            "lines,vendor,company",
            "vendor",
            "vendor,company",
          ])
          .optional(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "include_remote_data",
        type: "Query",
        schema: z.boolean().optional(),
      },
    ],
    response: VendorCredit,
  },
  {
    method: "get",
    path: "/webhook-receivers",
    description: `Returns a list of &#x60;WebhookReceiver&#x60; objects.`,
    requestFormat: "json",
    parameters: [
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: z.array(WebhookReceiver),
  },
  {
    method: "post",
    path: "/webhook-receivers",
    description: `Creates a &#x60;WebhookReceiver&#x60; object with the given values.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WebhookReceiverRequest,
      },
      {
        name: "X-Account-Token",
        type: "Header",
        schema: z.string(),
      },
    ],
    response: WebhookReceiver,
  },
]);

export const api = new ZodiosCore(endpoints);

api.get("/accounts/:id", {
  params: { id: "123" },
  headers: { "X-Account-Token": "abc" },
});
