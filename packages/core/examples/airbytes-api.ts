import { makeApi, ZodiosCore, type ZodiosOptions } from "../src";
import { z } from "zod";

const NotificationType = z.enum(["slack", "customerio"]);
const SlackNotificationConfiguration = z.object({ webhook: z.string() });
const CustomerioNotificationConfiguration = z.object({}).partial();
const Notification = z.object({
  notificationType: NotificationType,
  sendOnSuccess: z.boolean(),
  sendOnFailure: z.boolean().default(true),
  slackConfiguration: SlackNotificationConfiguration.optional(),
  customerioConfiguration: CustomerioNotificationConfiguration.optional(),
});
const Geography = z.enum(["auto", "us", "eu"]);
const WebhookConfigWrite = z
  .object({
    name: z.string(),
    authToken: z.string(),
    validationUrl: z.string(),
  })
  .partial();
const WorkspaceCreate = z.object({
  email: z.string().email().optional(),
  anonymousDataCollection: z.boolean().optional(),
  name: z.string(),
  news: z.boolean().optional(),
  securityUpdates: z.boolean().optional(),
  notifications: z.array(Notification).optional(),
  displaySetupWizard: z.boolean().optional(),
  defaultGeography: Geography.optional(),
  webhookConfigs: z.array(WebhookConfigWrite).optional(),
});
const WorkspaceId = z.string();
const CustomerId = z.string();
const WebhookConfigRead = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
});
const WorkspaceRead = z.object({
  workspaceId: WorkspaceId.uuid(),
  customerId: CustomerId.uuid(),
  email: z.string().email().optional(),
  name: z.string(),
  slug: z.string(),
  initialSetupComplete: z.boolean(),
  displaySetupWizard: z.boolean().optional(),
  anonymousDataCollection: z.boolean().optional(),
  news: z.boolean().optional(),
  securityUpdates: z.boolean().optional(),
  notifications: z.array(Notification).optional(),
  firstCompletedSync: z.boolean().optional(),
  feedbackDone: z.boolean().optional(),
  defaultGeography: Geography.optional(),
  webhookConfigs: z.array(WebhookConfigRead).optional(),
});
const WorkspaceIdRequestBody = z.object({ workspaceId: WorkspaceId.uuid() });
const WorkspaceReadList = z.object({ workspaces: z.array(WorkspaceRead) });
const SlugRequestBody = z.object({ slug: z.string() });
const ConnectionId = z.string();
const ConnectionIdRequestBody = z.object({ connectionId: ConnectionId.uuid() });
const WorkspaceUpdate = z.object({
  workspaceId: WorkspaceId.uuid(),
  email: z.string().email().optional(),
  initialSetupComplete: z.boolean().optional(),
  displaySetupWizard: z.boolean().optional(),
  anonymousDataCollection: z.boolean().optional(),
  news: z.boolean().optional(),
  securityUpdates: z.boolean().optional(),
  notifications: z.array(Notification).optional(),
  defaultGeography: Geography.optional(),
  webhookConfigs: z.array(WebhookConfigWrite).optional(),
});
const WorkspaceUpdateName = z.object({
  workspaceId: WorkspaceId.uuid(),
  name: z.string(),
});
const WorkspaceGiveFeedback = z.object({ workspaceId: WorkspaceId.uuid() });
const NotificationRead = z.object({
  status: z.enum(["succeeded", "failed"]),
  message: z.string().optional(),
});
const SourceDefinitionId = z.string();
const ResourceRequirements = z
  .object({
    cpu_request: z.string(),
    cpu_limit: z.string(),
    memory_request: z.string(),
    memory_limit: z.string(),
  })
  .partial();
const JobType = z.enum([
  "get_spec",
  "check_connection",
  "discover_schema",
  "sync",
  "reset_connection",
  "connection_updater",
  "replicate",
]);
const JobTypeResourceLimit = z.object({
  jobType: JobType,
  resourceRequirements: ResourceRequirements,
});
const ActorDefinitionResourceRequirements = z
  .object({
    default: ResourceRequirements,
    jobSpecific: z.array(JobTypeResourceLimit),
  })
  .partial();
const SourceDefinitionUpdate = z.object({
  sourceDefinitionId: SourceDefinitionId.uuid(),
  dockerImageTag: z.string(),
  resourceRequirements: ActorDefinitionResourceRequirements.optional(),
});
const ReleaseStage = z.enum(["alpha", "beta", "generally_available", "custom"]);
const SourceDefinitionRead = z.object({
  sourceDefinitionId: SourceDefinitionId.uuid(),
  name: z.string(),
  dockerRepository: z.string(),
  dockerImageTag: z.string(),
  documentationUrl: z.string().url().optional(),
  icon: z.string().optional(),
  protocolVersion: z.string().optional(),
  releaseStage: ReleaseStage.optional(),
  releaseDate: z.string().optional(),
  sourceType: z.enum(["api", "file", "database", "custom"]).optional(),
  resourceRequirements: ActorDefinitionResourceRequirements.optional(),
});
const SourceDefinitionReadList = z.object({
  sourceDefinitions: z.array(SourceDefinitionRead),
});
const SourceDefinitionIdRequestBody = z.object({
  sourceDefinitionId: SourceDefinitionId.uuid(),
});
const PrivateSourceDefinitionRead = z.object({
  sourceDefinition: SourceDefinitionRead,
  granted: z.boolean(),
});
const PrivateSourceDefinitionReadList = z.object({
  sourceDefinitions: z.array(PrivateSourceDefinitionRead),
});
const SourceDefinitionCreate = z.object({
  name: z.string(),
  dockerRepository: z.string(),
  dockerImageTag: z.string(),
  documentationUrl: z.string().url(),
  icon: z.string().optional(),
  resourceRequirements: ActorDefinitionResourceRequirements.optional(),
});
const CustomSourceDefinitionCreate = z.object({
  workspaceId: WorkspaceId.uuid(),
  sourceDefinition: SourceDefinitionCreate,
});
const SourceDefinitionIdWithWorkspaceId = z.object({
  sourceDefinitionId: SourceDefinitionId.uuid(),
  workspaceId: WorkspaceId.uuid(),
});
const SourceDefinitionSpecification = z.object({}).partial();
const OAuth2Specification = z.object({
  rootObject: z.array(z.unknown()),
  oauthFlowInitParameters: z.array(z.array(z.string())),
  oauthFlowOutputParameters: z.array(z.array(z.string())),
});
const AuthSpecification = z
  .object({
    auth_type: z.literal("oauth2.0"),
    oauth2Specification: OAuth2Specification,
  })
  .partial();
const SourceAuthSpecification = AuthSpecification;
const OAuthConfiguration = z.unknown();
const OAuthConfigSpecification = z
  .object({
    oauthUserInputFromConnectorConfigSpecification: OAuthConfiguration,
    completeOAuthOutputSpecification: OAuthConfiguration,
    completeOAuthServerInputSpecification: OAuthConfiguration,
    completeOAuthServerOutputSpecification: OAuthConfiguration,
  })
  .partial();
const AdvancedAuth = z
  .object({
    authFlowType: z.enum(["oauth2.0", "oauth1.0"]),
    predicateKey: z.array(z.string()),
    predicateValue: z.string(),
    oauthConfigSpecification: OAuthConfigSpecification,
  })
  .partial();
const JobConfigType = z.enum([
  "check_connection_source",
  "check_connection_destination",
  "discover_schema",
  "get_spec",
  "sync",
  "reset_connection",
]);
const LogRead = z.object({ logLines: z.array(z.string()) });
const SynchronousJobRead = z.object({
  id: z.string().uuid(),
  configType: JobConfigType,
  configId: z.string().optional(),
  createdAt: z.number().int(),
  endedAt: z.number().int(),
  succeeded: z.boolean(),
  connectorConfigurationUpdated: z.boolean().optional(),
  logs: LogRead.optional(),
});
const SourceDefinitionSpecificationRead = z.object({
  sourceDefinitionId: SourceDefinitionId.uuid(),
  documentationUrl: z.string().optional(),
  connectionSpecification: SourceDefinitionSpecification.optional(),
  authSpecification: SourceAuthSpecification.optional(),
  advancedAuth: AdvancedAuth.optional(),
  jobInfo: SynchronousJobRead,
});
const SourceConfiguration = z.unknown();
const SourceCreate = z.object({
  sourceDefinitionId: SourceDefinitionId.uuid(),
  connectionConfiguration: SourceConfiguration,
  workspaceId: WorkspaceId.uuid(),
  name: z.string(),
});
const SourceId = z.string();
const SourceRead = z.object({
  sourceDefinitionId: SourceDefinitionId.uuid(),
  sourceId: SourceId.uuid(),
  workspaceId: WorkspaceId.uuid(),
  connectionConfiguration: SourceConfiguration,
  name: z.string(),
  sourceName: z.string(),
  icon: z.string().optional(),
});
const SourceUpdate = z.object({
  sourceId: SourceId.uuid(),
  connectionConfiguration: SourceConfiguration,
  name: z.string(),
});
const SourceReadList = z.object({ sources: z.array(SourceRead) });
const SourceIdRequestBody = z.object({ sourceId: SourceId.uuid() });
const ActorCatalogWithUpdatedAt = z
  .object({ updatedAt: z.number().int(), catalog: z.object({}).partial() })
  .partial();
const SourceSearch = z
  .object({
    sourceDefinitionId: SourceDefinitionId.uuid(),
    sourceId: SourceId.uuid(),
    workspaceId: WorkspaceId.uuid(),
    connectionConfiguration: SourceConfiguration,
    name: z.string(),
    sourceName: z.string(),
  })
  .partial();
const SourceCloneConfiguration = z
  .object({ connectionConfiguration: SourceConfiguration, name: z.string() })
  .partial();
const SourceCloneRequestBody = z.object({
  sourceCloneId: SourceId.uuid(),
  sourceConfiguration: SourceCloneConfiguration.optional(),
});
const CheckConnectionRead = z.object({
  status: z.enum(["succeeded", "failed"]),
  message: z.string().optional(),
  jobInfo: SynchronousJobRead,
});
const SourceDiscoverSchemaRequestBody = z.object({
  sourceId: SourceId.uuid(),
  connectionId: z.string().uuid().optional(),
  disable_cache: z.boolean().optional(),
  notifySchemaChange: z.boolean().optional(),
});
const StreamJsonSchema = z.object({}).partial();
const SyncMode = z.enum(["full_refresh", "incremental"]);
const AirbyteStream = z.object({
  name: z.string(),
  jsonSchema: StreamJsonSchema.optional(),
  supportedSyncModes: z.array(SyncMode).optional(),
  sourceDefinedCursor: z.boolean().optional(),
  defaultCursorField: z.array(z.string()).optional(),
  sourceDefinedPrimaryKey: z.array(z.array(z.string())).optional(),
  namespace: z.string().optional(),
});
const DestinationSyncMode = z.enum(["append", "overwrite", "append_dedup"]);
const SelectedFieldInfo = z
  .object({ fieldPath: z.array(z.string()) })
  .partial();
const AirbyteStreamConfiguration = z.object({
  syncMode: SyncMode,
  cursorField: z.array(z.string()).optional(),
  destinationSyncMode: DestinationSyncMode,
  primaryKey: z.array(z.array(z.string())).optional(),
  aliasName: z.string().optional(),
  selected: z.boolean().optional(),
  suggested: z.boolean().optional(),
  fieldSelectionEnabled: z.boolean().optional(),
  selectedFields: z.array(SelectedFieldInfo).optional(),
});
const AirbyteStreamAndConfiguration = z
  .object({ stream: AirbyteStream, config: AirbyteStreamConfiguration })
  .partial();
const AirbyteCatalog = z.object({
  streams: z.array(AirbyteStreamAndConfiguration),
});
const StreamDescriptor = z.object({
  name: z.string(),
  namespace: z.string().optional(),
});
const FieldName = z.array(z.string());
const FieldSchema = z.object({}).partial();
const FieldAdd = z.object({ schema: FieldSchema }).partial();
const FieldRemove = z.object({ schema: FieldSchema }).partial();
const FieldSchemaUpdate = z.object({
  oldSchema: FieldSchema,
  newSchema: FieldSchema,
});
const FieldTransform = z.object({
  transformType: z.enum(["add_field", "remove_field", "update_field_schema"]),
  fieldName: FieldName,
  breaking: z.boolean(),
  addField: FieldAdd.optional(),
  removeField: FieldRemove.optional(),
  updateFieldSchema: FieldSchemaUpdate.optional(),
});
const StreamTransform = z.object({
  transformType: z.enum(["add_stream", "remove_stream", "update_stream"]),
  streamDescriptor: StreamDescriptor,
  updateStream: z.array(FieldTransform).optional(),
});
const CatalogDiff = z.object({ transforms: z.array(StreamTransform) });
const ConnectionStatus = z.enum(["active", "inactive", "deprecated"]);
const SourceDiscoverSchemaRead = z.object({
  catalog: AirbyteCatalog.optional(),
  jobInfo: SynchronousJobRead,
  catalogId: z.string().uuid().optional(),
  catalogDiff: CatalogDiff.optional(),
  breakingChange: z.boolean().optional(),
  connectionStatus: ConnectionStatus.optional(),
});
const SourceDiscoverSchemaWriteRequestBody = z.object({
  catalog: AirbyteCatalog,
  sourceId: SourceId.uuid().optional(),
  connectorVersion: z.string().optional(),
  configurationHash: z.string().optional(),
});
const DiscoverCatalogResult = z.object({ catalogId: z.string().uuid() });
const DestinationDefinitionId = z.string();
const DestinationDefinitionUpdate = z.object({
  destinationDefinitionId: DestinationDefinitionId.uuid(),
  dockerImageTag: z.string().optional(),
  resourceRequirements: ActorDefinitionResourceRequirements.optional(),
});
const NormalizationDestinationDefinitionConfig = z.object({
  supported: z.boolean(),
  normalizationRepository: z.string().optional(),
  normalizationTag: z.string().optional(),
  normalizationIntegrationType: z.string().optional(),
});
const DestinationDefinitionRead = z.object({
  destinationDefinitionId: DestinationDefinitionId.uuid(),
  name: z.string(),
  dockerRepository: z.string(),
  dockerImageTag: z.string(),
  documentationUrl: z.string().url(),
  icon: z.string().optional(),
  protocolVersion: z.string().optional(),
  releaseStage: ReleaseStage.optional(),
  releaseDate: z.string().optional(),
  resourceRequirements: ActorDefinitionResourceRequirements.optional(),
  supportsDbt: z.boolean(),
  normalizationConfig: NormalizationDestinationDefinitionConfig,
});
const DestinationDefinitionReadList = z.object({
  destinationDefinitions: z.array(DestinationDefinitionRead),
});
const DestinationDefinitionIdRequestBody = z.object({
  destinationDefinitionId: DestinationDefinitionId.uuid(),
});
const PrivateDestinationDefinitionRead = z.object({
  destinationDefinition: DestinationDefinitionRead,
  granted: z.boolean(),
});
const PrivateDestinationDefinitionReadList = z.object({
  destinationDefinitions: z.array(PrivateDestinationDefinitionRead),
});
const DestinationDefinitionCreate = z.object({
  name: z.string(),
  dockerRepository: z.string(),
  dockerImageTag: z.string(),
  documentationUrl: z.string().url(),
  icon: z.string().optional(),
  resourceRequirements: ActorDefinitionResourceRequirements.optional(),
});
const CustomDestinationDefinitionCreate = z.object({
  workspaceId: WorkspaceId.uuid(),
  destinationDefinition: DestinationDefinitionCreate,
});
const DestinationDefinitionIdWithWorkspaceId = z.object({
  destinationDefinitionId: DestinationDefinitionId.uuid(),
  workspaceId: WorkspaceId.uuid(),
});
const DestinationDefinitionSpecification = z.unknown();
const DestinationAuthSpecification = AuthSpecification;
const DestinationDefinitionSpecificationRead = z.object({
  destinationDefinitionId: DestinationDefinitionId.uuid(),
  documentationUrl: z.string().optional(),
  connectionSpecification: DestinationDefinitionSpecification.optional(),
  authSpecification: DestinationAuthSpecification.optional(),
  advancedAuth: AdvancedAuth.optional(),
  jobInfo: SynchronousJobRead,
  supportedDestinationSyncModes: z.array(DestinationSyncMode).optional(),
});
const DestinationConfiguration = z.unknown();
const DestinationCreate = z.object({
  workspaceId: WorkspaceId.uuid(),
  name: z.string(),
  destinationDefinitionId: DestinationDefinitionId.uuid(),
  connectionConfiguration: DestinationConfiguration,
});
const DestinationId = z.string();
const DestinationRead = z.object({
  destinationDefinitionId: DestinationDefinitionId.uuid(),
  destinationId: DestinationId.uuid(),
  workspaceId: WorkspaceId.uuid(),
  connectionConfiguration: DestinationConfiguration,
  name: z.string(),
  destinationName: z.string(),
  icon: z.string().optional(),
});
const DestinationUpdate = z.object({
  destinationId: DestinationId.uuid(),
  connectionConfiguration: DestinationConfiguration,
  name: z.string(),
});
const DestinationReadList = z.object({
  destinations: z.array(DestinationRead),
});
const DestinationIdRequestBody = z.object({
  destinationId: DestinationId.uuid(),
});
const DestinationSearch = z
  .object({
    destinationDefinitionId: DestinationDefinitionId.uuid(),
    destinationId: DestinationId.uuid(),
    workspaceId: WorkspaceId.uuid(),
    connectionConfiguration: DestinationConfiguration,
    name: z.string(),
    destinationName: z.string(),
  })
  .partial();
const DestinationCloneConfiguration = z
  .object({
    connectionConfiguration: DestinationConfiguration,
    name: z.string(),
  })
  .partial();
const DestinationCloneRequestBody = z.object({
  destinationCloneId: DestinationId.uuid(),
  destinationConfiguration: DestinationCloneConfiguration.optional(),
});
const NamespaceDefinitionType = z.enum([
  "source",
  "destination",
  "customformat",
]);
const OperationId = z.string();
const ConnectionSchedule = z.object({
  units: z.number().int(),
  timeUnit: z.enum(["minutes", "hours", "days", "weeks", "months"]),
});
const ConnectionScheduleType = z.enum(["manual", "basic", "cron"]);
const ConnectionScheduleData = z
  .object({
    basicSchedule: z.object({
      timeUnit: z.enum(["minutes", "hours", "days", "weeks", "months"]),
      units: z.number().int(),
    }),
    cron: z.object({ cronExpression: z.string(), cronTimeZone: z.string() }),
  })
  .partial();
const NonBreakingChangesPreference = z.enum(["ignore", "disable"]);
const ConnectionCreate = z.object({
  name: z.string().optional(),
  namespaceDefinition: NamespaceDefinitionType.optional(),
  namespaceFormat: z.string().optional(),
  prefix: z.string().optional(),
  sourceId: SourceId.uuid(),
  destinationId: DestinationId.uuid(),
  operationIds: z.array(OperationId).optional(),
  syncCatalog: AirbyteCatalog.optional(),
  schedule: ConnectionSchedule.optional(),
  scheduleType: ConnectionScheduleType.optional(),
  scheduleData: ConnectionScheduleData.optional(),
  status: ConnectionStatus,
  resourceRequirements: ResourceRequirements.optional(),
  sourceCatalogId: z.string().uuid().optional(),
  geography: Geography.optional(),
  notifySchemaChanges: z.boolean().optional(),
  nonBreakingChangesPreference: NonBreakingChangesPreference.optional(),
});
const ConnectionRead = z.object({
  connectionId: ConnectionId.uuid(),
  name: z.string(),
  namespaceDefinition: NamespaceDefinitionType.optional(),
  namespaceFormat: z.string().optional(),
  prefix: z.string().optional(),
  sourceId: SourceId.uuid(),
  destinationId: DestinationId.uuid(),
  operationIds: z.array(OperationId).optional(),
  syncCatalog: AirbyteCatalog,
  schedule: ConnectionSchedule.optional(),
  scheduleType: ConnectionScheduleType.optional(),
  scheduleData: ConnectionScheduleData.optional(),
  status: ConnectionStatus,
  resourceRequirements: ResourceRequirements.optional(),
  sourceCatalogId: z.string().uuid().optional(),
  geography: Geography.optional(),
  breakingChange: z.boolean(),
  notifySchemaChanges: z.boolean().optional(),
  nonBreakingChangesPreference: NonBreakingChangesPreference.optional(),
});
const ConnectionUpdate = z.object({
  connectionId: ConnectionId.uuid(),
  namespaceDefinition: NamespaceDefinitionType.optional(),
  namespaceFormat: z.string().optional(),
  name: z.string().optional(),
  prefix: z.string().optional(),
  operationIds: z.array(OperationId).optional(),
  syncCatalog: AirbyteCatalog.optional(),
  schedule: ConnectionSchedule.optional(),
  scheduleType: ConnectionScheduleType.optional(),
  scheduleData: ConnectionScheduleData.optional(),
  status: ConnectionStatus.optional(),
  resourceRequirements: ResourceRequirements.optional(),
  sourceCatalogId: z.string().uuid().optional(),
  geography: Geography.optional(),
  notifySchemaChanges: z.boolean().optional(),
  nonBreakingChangesPreference: NonBreakingChangesPreference.optional(),
  breakingChange: z.boolean().optional(),
});
const ConnectionReadList = z.object({ connections: z.array(ConnectionRead) });
const ConnectionStateType = z.enum(["global", "stream", "legacy", "not_set"]);
const StateBlob = z.object({}).partial();
const StreamState = z.object({
  streamDescriptor: StreamDescriptor,
  streamState: StateBlob.optional(),
});
const GlobalState = z.object({
  shared_state: StateBlob.optional(),
  streamStates: z.array(StreamState),
});
const ConnectionState = z.object({
  stateType: ConnectionStateType,
  connectionId: ConnectionId.uuid(),
  state: StateBlob.optional(),
  streamState: z.array(StreamState).optional(),
  globalState: GlobalState.optional(),
});
const ConnectionStateCreateOrUpdate = z.object({
  connectionId: ConnectionId.uuid(),
  connectionState: ConnectionState,
});
const ConnectionSearch = z
  .object({
    connectionId: ConnectionId.uuid(),
    name: z.string(),
    namespaceDefinition: NamespaceDefinitionType,
    namespaceFormat: z.string(),
    prefix: z.string(),
    sourceId: SourceId.uuid(),
    destinationId: DestinationId.uuid(),
    schedule: ConnectionSchedule,
    scheduleType: ConnectionScheduleType,
    scheduleData: ConnectionScheduleData,
    status: ConnectionStatus,
    source: SourceSearch,
    destination: DestinationSearch,
  })
  .partial();
const JobId = z.number();
const JobStatus = z.enum([
  "pending",
  "running",
  "incomplete",
  "failed",
  "succeeded",
  "cancelled",
]);
const ResetConfig = z
  .object({ streamsToReset: z.array(StreamDescriptor) })
  .partial();
const JobRead = z.object({
  id: JobId.int(),
  configType: JobConfigType,
  configId: z.string(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
  startedAt: z.number().int().optional(),
  status: JobStatus,
  resetConfig: ResetConfig.optional(),
});
const AttemptStatus = z.enum(["running", "failed", "succeeded"]);
const AttemptStats = z
  .object({
    recordsEmitted: z.number().int(),
    bytesEmitted: z.number().int(),
    stateMessagesEmitted: z.number().int(),
    recordsCommitted: z.number().int(),
    estimatedRecords: z.number().int(),
    estimatedBytes: z.number().int(),
  })
  .partial();
const AttemptStreamStats = z.object({
  streamName: z.string(),
  streamNamespace: z.string().optional(),
  stats: AttemptStats,
});
const AttemptFailureOrigin = z.enum([
  "source",
  "destination",
  "replication",
  "persistence",
  "normalization",
  "dbt",
  "airbyte_platform",
  "unknown",
]);
const AttemptFailureType = z.enum([
  "config_error",
  "system_error",
  "manual_cancellation",
  "refresh_schema",
]);
const AttemptFailureReason = z.object({
  failureOrigin: AttemptFailureOrigin.optional(),
  failureType: AttemptFailureType.optional(),
  externalMessage: z.string().optional(),
  internalMessage: z.string().optional(),
  stacktrace: z.string().optional(),
  retryable: z.boolean().optional(),
  timestamp: z.number().int(),
});
const AttemptFailureSummary = z.object({
  failures: z.array(AttemptFailureReason),
  partialSuccess: z.boolean().optional(),
});
const AttemptRead = z.object({
  id: z.number().int(),
  status: AttemptStatus,
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
  endedAt: z.number().int().optional(),
  bytesSynced: z.number().int().optional(),
  recordsSynced: z.number().int().optional(),
  totalStats: AttemptStats.optional(),
  streamStats: z.array(AttemptStreamStats).optional(),
  failureSummary: AttemptFailureSummary.optional(),
});
const AttemptInfoRead = z.object({ attempt: AttemptRead, logs: LogRead });
const JobInfoRead = z.object({
  job: JobRead,
  attempts: z.array(AttemptInfoRead),
});
const OperatorType = z.enum(["normalization", "dbt", "webhook"]);
const OperatorNormalization = z
  .object({ option: z.literal("basic") })
  .partial();
const OperatorDbt = z.object({
  gitRepoUrl: z.string(),
  gitRepoBranch: z.string().optional(),
  dockerImage: z.string().optional(),
  dbtArguments: z.string().optional(),
});
const OperatorWebhook = z
  .object({
    webhookConfigId: z.string().uuid(),
    webhookType: z.literal("dbtCloud"),
    dbtCloud: z.object({
      accountId: z.number().int(),
      jobId: z.number().int(),
    }),
    executionUrl: z.string(),
    executionBody: z.string(),
  })
  .partial();
const OperatorConfiguration = z.object({
  operatorType: OperatorType,
  normalization: OperatorNormalization.optional(),
  dbt: OperatorDbt.optional(),
  webhook: OperatorWebhook.optional(),
});
const CheckOperationRead = z.object({
  status: z.enum(["succeeded", "failed"]),
  message: z.string().optional(),
});
const OperationCreate = z.object({
  workspaceId: WorkspaceId.uuid(),
  name: z.string(),
  operatorConfiguration: OperatorConfiguration,
});
const OperationRead = z.object({
  workspaceId: WorkspaceId.uuid(),
  operationId: OperationId.uuid(),
  name: z.string(),
  operatorConfiguration: OperatorConfiguration,
});
const OperationUpdate = z.object({
  operationId: OperationId.uuid(),
  name: z.string(),
  operatorConfiguration: OperatorConfiguration,
});
const OperationReadList = z.object({ operations: z.array(OperationRead) });
const OperationIdRequestBody = z.object({ operationId: OperationId.uuid() });
const SourceCoreConfig = z.object({
  sourceId: SourceId.uuid().optional(),
  sourceDefinitionId: SourceDefinitionId.uuid(),
  connectionConfiguration: SourceConfiguration,
  workspaceId: WorkspaceId.uuid(),
});
const DestinationCoreConfig = z.object({
  destinationId: DestinationId.uuid().optional(),
  destinationDefinitionId: DestinationDefinitionId.uuid(),
  connectionConfiguration: DestinationConfiguration,
  workspaceId: WorkspaceId.uuid(),
});
const SetInstancewideSourceOauthParamsRequestBody = z.object({
  sourceDefinitionId: SourceDefinitionId.uuid(),
  params: z.object({}).partial().passthrough(),
});
const OAuthInputConfiguration = OAuthConfiguration;
const SourceOauthConsentRequest = z.object({
  sourceDefinitionId: SourceDefinitionId.uuid(),
  workspaceId: WorkspaceId.uuid(),
  redirectUrl: z.string(),
  oAuthInputConfiguration: OAuthInputConfiguration.optional(),
  sourceId: SourceId.uuid().optional(),
});
const OAuthConsentRead = z.object({ consentUrl: z.string() });
const CompleteSourceOauthRequest = z.object({
  sourceDefinitionId: SourceDefinitionId.uuid(),
  workspaceId: WorkspaceId.uuid(),
  redirectUrl: z.string().optional(),
  queryParams: z.object({}).partial().passthrough().optional(),
  oAuthInputConfiguration: OAuthInputConfiguration.optional(),
  sourceId: SourceId.uuid().optional(),
});
const CompleteOAuthResponse = z.object({}).partial().passthrough();
const DestinationOauthConsentRequest = z.object({
  destinationDefinitionId: DestinationDefinitionId.uuid(),
  workspaceId: WorkspaceId.uuid(),
  redirectUrl: z.string(),
  oAuthInputConfiguration: OAuthInputConfiguration.optional(),
  destinationId: DestinationId.uuid().optional(),
});
const CompleteDestinationOAuthRequest = z.object({
  destinationDefinitionId: DestinationDefinitionId.uuid(),
  workspaceId: WorkspaceId.uuid(),
  redirectUrl: z.string().optional(),
  queryParams: z.object({}).partial().passthrough().optional(),
  oAuthInputConfiguration: OAuthInputConfiguration.optional(),
  destinationId: DestinationId.uuid().optional(),
});
const SetInstancewideDestinationOauthParamsRequestBody = z.object({
  destinationDefinitionId: DestinationDefinitionId.uuid(),
  params: z.object({}).partial().passthrough(),
});
const WebBackendCheckUpdatesRead = z.object({
  destinationDefinitions: z.number().int(),
  sourceDefinitions: z.number().int(),
});
const WebBackendConnectionListRequestBody = z.object({
  workspaceId: WorkspaceId.uuid(),
  sourceId: z.array(SourceId).optional(),
  destinationId: z.array(DestinationId).optional(),
});
const SourceSnippetRead = z.object({
  sourceId: SourceId.uuid(),
  name: z.string(),
  sourceDefinitionId: SourceDefinitionId.uuid(),
  sourceName: z.string(),
  icon: z.string().optional(),
});
const DestinationSnippetRead = z.object({
  destinationId: DestinationId.uuid(),
  name: z.string(),
  destinationDefinitionId: DestinationDefinitionId.uuid(),
  destinationName: z.string(),
  icon: z.string().optional(),
});
const JobCreatedAt = z.number();
const SchemaChange = z.enum(["no_change", "non_breaking", "breaking"]);
const WebBackendConnectionListItem = z.object({
  connectionId: ConnectionId.uuid(),
  name: z.string(),
  scheduleType: ConnectionScheduleType.optional(),
  scheduleData: ConnectionScheduleData.optional(),
  status: ConnectionStatus,
  source: SourceSnippetRead,
  destination: DestinationSnippetRead,
  latestSyncJobCreatedAt: JobCreatedAt.int().optional(),
  latestSyncJobStatus: JobStatus.optional(),
  isSyncing: z.boolean(),
  schemaChange: SchemaChange,
});
const WebBackendConnectionReadList = z.object({
  connections: z.array(WebBackendConnectionListItem),
});
const WebBackendConnectionRequestBody = z.object({
  withRefreshedCatalog: z.boolean().optional(),
  connectionId: ConnectionId.uuid(),
});
const WebBackendConnectionRead = z.object({
  connectionId: ConnectionId.uuid(),
  name: z.string(),
  namespaceDefinition: NamespaceDefinitionType.optional(),
  namespaceFormat: z.string().optional(),
  prefix: z.string().optional(),
  sourceId: SourceId.uuid(),
  destinationId: DestinationId.uuid(),
  syncCatalog: AirbyteCatalog,
  schedule: ConnectionSchedule.optional(),
  scheduleType: ConnectionScheduleType.optional(),
  scheduleData: ConnectionScheduleData.optional(),
  status: ConnectionStatus,
  operationIds: z.array(OperationId).optional(),
  source: SourceRead,
  destination: DestinationRead,
  operations: z.array(OperationRead).optional(),
  latestSyncJobCreatedAt: JobCreatedAt.int().optional(),
  latestSyncJobStatus: JobStatus.optional(),
  isSyncing: z.boolean(),
  resourceRequirements: ResourceRequirements.optional(),
  catalogId: z.string().uuid().optional(),
  catalogDiff: CatalogDiff.optional(),
  geography: Geography.optional(),
  schemaChange: SchemaChange,
  notifySchemaChanges: z.boolean(),
  nonBreakingChangesPreference: NonBreakingChangesPreference,
});
const WebBackendConnectionCreate = z.object({
  name: z.string().optional(),
  namespaceDefinition: NamespaceDefinitionType.optional(),
  namespaceFormat: z.string().optional(),
  prefix: z.string().optional(),
  sourceId: SourceId.uuid(),
  destinationId: DestinationId.uuid(),
  operationIds: z.array(OperationId).optional(),
  syncCatalog: AirbyteCatalog.optional(),
  schedule: ConnectionSchedule.optional(),
  scheduleType: ConnectionScheduleType.optional(),
  scheduleData: ConnectionScheduleData.optional(),
  status: ConnectionStatus,
  resourceRequirements: ResourceRequirements.optional(),
  operations: z.array(OperationCreate).optional(),
  sourceCatalogId: z.string().uuid().optional(),
  geography: Geography.optional(),
  nonBreakingChangesPreference: NonBreakingChangesPreference.optional(),
});
const WebBackendOperationCreateOrUpdate = z.object({
  operationId: OperationId.uuid().optional(),
  workspaceId: WorkspaceId.uuid(),
  name: z.string(),
  operatorConfiguration: OperatorConfiguration,
});
const WebBackendConnectionUpdate = z.object({
  name: z.string().optional(),
  connectionId: ConnectionId.uuid(),
  namespaceDefinition: NamespaceDefinitionType.optional(),
  namespaceFormat: z.string().optional(),
  prefix: z.string().optional(),
  syncCatalog: AirbyteCatalog.optional(),
  schedule: ConnectionSchedule.optional(),
  scheduleType: ConnectionScheduleType.optional(),
  scheduleData: ConnectionScheduleData.optional(),
  status: ConnectionStatus.optional(),
  resourceRequirements: ResourceRequirements.optional(),
  skipReset: z.boolean().optional(),
  operations: z.array(WebBackendOperationCreateOrUpdate).optional(),
  sourceCatalogId: z.string().uuid().optional(),
  geography: Geography.optional(),
  notifySchemaChanges: z.boolean().optional(),
  nonBreakingChangesPreference: NonBreakingChangesPreference.optional(),
});
const WebBackendWorkspaceState = z.object({ workspaceId: WorkspaceId.uuid() });
const WebBackendWorkspaceStateResult = z.object({
  hasConnections: z.boolean(),
  hasSources: z.boolean(),
  hasDestinations: z.boolean(),
});
const WebBackendGeographiesListResult = z.object({
  geographies: z.array(Geography),
});
const Pagination = z
  .object({ pageSize: z.number().int(), rowOffset: z.number().int() })
  .partial();
const JobListRequestBody = z.object({
  configTypes: z.array(JobConfigType),
  configId: z.string(),
  includingJobId: JobId.int().optional(),
  pagination: Pagination.optional(),
});
const JobWithAttemptsRead = z
  .object({ job: JobRead, attempts: z.array(AttemptRead) })
  .partial();
const JobReadList = z.object({
  jobs: z.array(JobWithAttemptsRead),
  totalJobCount: z.number().int(),
});
const JobIdRequestBody = z.object({ id: JobId.int() });
const JobOptionalRead = z.object({ job: JobRead }).partial();
const JobInfoLightRead = z.object({ job: JobRead });
const JobDebugRead = z.object({
  id: JobId.int(),
  configType: JobConfigType,
  configId: z.string(),
  status: JobStatus,
  airbyteVersion: z.string(),
  sourceDefinition: SourceDefinitionRead,
  destinationDefinition: DestinationDefinitionRead,
});
const WorkflowStateRead = z.object({ running: z.boolean() });
const JobDebugInfoRead = z.object({
  job: JobDebugRead,
  attempts: z.array(AttemptInfoRead),
  workflowState: WorkflowStateRead.optional(),
});
const AttemptNumber = z.number();
const AttemptNormalizationStatusRead = z
  .object({
    attemptNumber: AttemptNumber.int(),
    hasRecordsCommitted: z.boolean(),
    recordsCommitted: z.number().int(),
    hasNormalizationFailed: z.boolean(),
  })
  .partial();
const AttemptNormalizationStatusReadList = z
  .object({
    attemptNormalizationStatuses: z.array(AttemptNormalizationStatusRead),
  })
  .partial();
const HealthCheckRead = z.object({ available: z.boolean() });
const LogType = z.enum(["server", "scheduler"]);
const LogsRequestBody = z.object({ logType: LogType });
const WorkflowId = z.string();
const SetWorkflowInAttemptRequestBody = z.object({
  jobId: JobId.int(),
  attemptNumber: AttemptNumber.int(),
  workflowId: WorkflowId,
  processingTaskQueue: z.string().optional(),
});
const InternalOperationResult = z.object({ succeeded: z.boolean() });
const SaveStatsRequestBody = z.object({
  jobId: JobId.int(),
  attemptNumber: AttemptNumber.int(),
  stats: AttemptStats,
  streamStats: z.array(AttemptStreamStats).optional(),
});
const AttemptSyncConfig = z.object({
  sourceConfiguration: SourceConfiguration,
  destinationConfiguration: DestinationConfiguration,
  state: ConnectionState.optional(),
});
const SaveAttemptSyncConfigRequestBody = z.object({
  jobId: JobId.int(),
  attemptNumber: AttemptNumber.int(),
  syncConfig: AttemptSyncConfig,
});

const endpoints = makeApi([
  {
    method: "post",
    path: "/v1/attempt/save_stats",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SaveStatsRequestBody,
      },
    ],
    response: z.object({ succeeded: z.boolean() }),
  },
  {
    method: "post",
    path: "/v1/attempt/save_sync_config",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SaveAttemptSyncConfigRequestBody,
      },
    ],
    response: z.object({ succeeded: z.boolean() }),
  },
  {
    method: "post",
    path: "/v1/attempt/set_workflow_in_attempt",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SetWorkflowInAttemptRequestBody,
      },
    ],
    response: z.object({ succeeded: z.boolean() }),
  },
  {
    method: "post",
    path: "/v1/connections/create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ConnectionCreate,
      },
    ],
    response: ConnectionRead,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/connections/delete",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ConnectionIdRequestBody,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/connections/get",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ConnectionIdRequestBody,
      },
    ],
    response: ConnectionRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/connections/list",
    description: `List connections for workspace. Does not return deleted connections.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkspaceIdRequestBody,
      },
    ],
    response: ConnectionReadList,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/connections/list_all",
    description: `List connections for workspace, including deleted connections.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkspaceIdRequestBody,
      },
    ],
    response: ConnectionReadList,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/connections/reset",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ConnectionIdRequestBody,
      },
    ],
    response: JobInfoRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/connections/search",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ConnectionSearch,
      },
    ],
    response: ConnectionReadList,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/connections/sync",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ConnectionIdRequestBody,
      },
    ],
    response: JobInfoRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/connections/update",
    description: `Apply a patch-style update to a connection. Only fields present on the update request body will be updated.
Note that if a catalog is present in the request body, the connection&#x27;s entire catalog will be replaced
with the catalog from the request. This means that to modify a single stream, the entire new catalog
containing the updated stream needs to be sent.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ConnectionUpdate,
      },
    ],
    response: ConnectionRead,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destination_definition_specifications/get",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationDefinitionIdWithWorkspaceId,
      },
    ],
    response: DestinationDefinitionSpecificationRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destination_definitions/create_custom",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CustomDestinationDefinitionCreate,
      },
    ],
    response: DestinationDefinitionRead,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destination_definitions/delete",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationDefinitionIdRequestBody,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destination_definitions/get",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationDefinitionIdRequestBody,
      },
    ],
    response: DestinationDefinitionRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destination_definitions/get_for_workspace",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationDefinitionIdWithWorkspaceId,
      },
    ],
    response: DestinationDefinitionRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destination_definitions/grant_definition",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationDefinitionIdWithWorkspaceId,
      },
    ],
    response: PrivateDestinationDefinitionRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destination_definitions/list",
    requestFormat: "json",
    response: DestinationDefinitionReadList,
  },
  {
    method: "post",
    path: "/v1/destination_definitions/list_for_workspace",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkspaceIdRequestBody,
      },
    ],
    response: DestinationDefinitionReadList,
  },
  {
    method: "post",
    path: "/v1/destination_definitions/list_latest",
    description: `Guaranteed to retrieve the latest information on supported destinations.`,
    requestFormat: "json",
    response: DestinationDefinitionReadList,
  },
  {
    method: "post",
    path: "/v1/destination_definitions/list_private",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkspaceIdRequestBody,
      },
    ],
    response: PrivateDestinationDefinitionReadList,
  },
  {
    method: "post",
    path: "/v1/destination_definitions/revoke_definition",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationDefinitionIdWithWorkspaceId,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destination_definitions/update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationDefinitionUpdate,
      },
    ],
    response: DestinationDefinitionRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destination_oauths/complete_oauth",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CompleteDestinationOAuthRequest,
      },
    ],
    response: z.object({}).partial().passthrough(),
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destination_oauths/get_consent_url",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationOauthConsentRequest,
      },
    ],
    response: z.object({ consentUrl: z.string() }),
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destination_oauths/oauth_params/create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SetInstancewideDestinationOauthParamsRequestBody,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destinations/check_connection",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationIdRequestBody,
      },
    ],
    response: CheckConnectionRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destinations/check_connection_for_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationUpdate,
      },
    ],
    response: CheckConnectionRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destinations/clone",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationCloneRequestBody,
      },
    ],
    response: DestinationRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destinations/create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationCreate,
      },
    ],
    response: DestinationRead,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destinations/delete",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationIdRequestBody,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destinations/get",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationIdRequestBody,
      },
    ],
    response: DestinationRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destinations/list",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkspaceIdRequestBody,
      },
    ],
    response: DestinationReadList,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destinations/search",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationSearch,
      },
    ],
    response: DestinationReadList,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/destinations/update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationUpdate,
      },
    ],
    response: DestinationRead,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/v1/health",
    requestFormat: "json",
    response: z.object({ available: z.boolean() }),
  },
  {
    method: "post",
    path: "/v1/jobs/cancel",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: JobIdRequestBody,
      },
    ],
    response: JobInfoRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/jobs/get",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: JobIdRequestBody,
      },
    ],
    response: JobInfoRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/jobs/get_debug_info",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: JobIdRequestBody,
      },
    ],
    response: JobDebugInfoRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/jobs/get_last_replication_job",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ConnectionIdRequestBody,
      },
    ],
    response: JobOptionalRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/jobs/get_light",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: JobIdRequestBody,
      },
    ],
    response: JobInfoLightRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/jobs/get_normalization_status",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: JobIdRequestBody,
      },
    ],
    response: AttemptNormalizationStatusReadList,
  },
  {
    method: "post",
    path: "/v1/jobs/list",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: JobListRequestBody,
      },
    ],
    response: JobReadList,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/logs/get",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LogsRequestBody,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/notifications/try",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: Notification,
      },
    ],
    response: NotificationRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/v1/openapi",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "post",
    path: "/v1/operations/check",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OperatorConfiguration,
      },
    ],
    response: CheckOperationRead,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/operations/create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OperationCreate,
      },
    ],
    response: OperationRead,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/operations/delete",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OperationIdRequestBody,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/operations/get",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OperationIdRequestBody,
      },
    ],
    response: OperationRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/operations/list",
    description: `List operations for connection.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ConnectionIdRequestBody,
      },
    ],
    response: OperationReadList,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/operations/update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OperationUpdate,
      },
    ],
    response: OperationRead,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/scheduler/destinations/check_connection",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DestinationCoreConfig,
      },
    ],
    response: CheckConnectionRead,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/scheduler/sources/check_connection",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceCoreConfig,
      },
    ],
    response: CheckConnectionRead,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/scheduler/sources/discover_schema",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceCoreConfig,
      },
    ],
    response: SourceDiscoverSchemaRead,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/source_definition_specifications/get",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceDefinitionIdWithWorkspaceId,
      },
    ],
    response: SourceDefinitionSpecificationRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/source_definitions/create_custom",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CustomSourceDefinitionCreate,
      },
    ],
    response: SourceDefinitionRead,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/source_definitions/delete",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceDefinitionIdRequestBody,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/source_definitions/get",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceDefinitionIdRequestBody,
      },
    ],
    response: SourceDefinitionRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/source_definitions/get_for_workspace",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceDefinitionIdWithWorkspaceId,
      },
    ],
    response: SourceDefinitionRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/source_definitions/grant_definition",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceDefinitionIdWithWorkspaceId,
      },
    ],
    response: PrivateSourceDefinitionRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/source_definitions/list",
    requestFormat: "json",
    response: SourceDefinitionReadList,
  },
  {
    method: "post",
    path: "/v1/source_definitions/list_for_workspace",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkspaceIdRequestBody,
      },
    ],
    response: SourceDefinitionReadList,
  },
  {
    method: "post",
    path: "/v1/source_definitions/list_latest",
    description: `Guaranteed to retrieve the latest information on supported sources.`,
    requestFormat: "json",
    response: SourceDefinitionReadList,
  },
  {
    method: "post",
    path: "/v1/source_definitions/list_private",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkspaceIdRequestBody,
      },
    ],
    response: PrivateSourceDefinitionReadList,
  },
  {
    method: "post",
    path: "/v1/source_definitions/revoke_definition",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceDefinitionIdWithWorkspaceId,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/source_definitions/update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceDefinitionUpdate,
      },
    ],
    response: SourceDefinitionRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/source_oauths/complete_oauth",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CompleteSourceOauthRequest,
      },
    ],
    response: z.object({}).partial().passthrough(),
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/source_oauths/get_consent_url",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceOauthConsentRequest,
      },
    ],
    response: z.object({ consentUrl: z.string() }),
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/source_oauths/oauth_params/create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SetInstancewideSourceOauthParamsRequestBody,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        schema: z.void(),
      },
      {
        status: 404,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/sources/check_connection",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceIdRequestBody,
      },
    ],
    response: CheckConnectionRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/sources/check_connection_for_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceUpdate,
      },
    ],
    response: CheckConnectionRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/sources/clone",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceCloneRequestBody,
      },
    ],
    response: SourceRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/sources/create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceCreate,
      },
    ],
    response: SourceRead,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/sources/delete",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceIdRequestBody,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/sources/discover_schema",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceDiscoverSchemaRequestBody,
      },
    ],
    response: SourceDiscoverSchemaRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/sources/get",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceIdRequestBody,
      },
    ],
    response: SourceRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/sources/list",
    description: `List sources for workspace. Does not return deleted sources.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkspaceIdRequestBody,
      },
    ],
    response: SourceReadList,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/sources/most_recent_source_actor_catalog",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceIdRequestBody,
      },
    ],
    response: ActorCatalogWithUpdatedAt,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/sources/search",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceSearch,
      },
    ],
    response: SourceReadList,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/sources/update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceUpdate,
      },
    ],
    response: SourceRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/sources/write_discover_catalog_result",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SourceDiscoverSchemaWriteRequestBody,
      },
    ],
    response: z.object({ catalogId: z.string().uuid() }),
  },
  {
    method: "post",
    path: "/v1/state/create_or_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ConnectionStateCreateOrUpdate,
      },
    ],
    response: ConnectionState,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/state/get",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ConnectionIdRequestBody,
      },
    ],
    response: ConnectionState,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/web_backend/check_updates",
    requestFormat: "json",
    response: WebBackendCheckUpdatesRead,
  },
  {
    method: "post",
    path: "/v1/web_backend/connections/create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WebBackendConnectionCreate,
      },
    ],
    response: WebBackendConnectionRead,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/web_backend/connections/get",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WebBackendConnectionRequestBody,
      },
    ],
    response: WebBackendConnectionRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/web_backend/connections/list",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WebBackendConnectionListRequestBody,
      },
    ],
    response: WebBackendConnectionReadList,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/web_backend/connections/update",
    description: `Apply a patch-style update to a connection. Only fields present on the update request body will be updated.
Any operations that lack an ID will be created. Then, the newly created operationId will be applied to the
connection along with the rest of the operationIds in the request body.
Apply a patch-style update to a connection. Only fields present on the update request body will be updated.
Note that if a catalog is present in the request body, the connection&#x27;s entire catalog will be replaced
with the catalog from the request. This means that to modify a single stream, the entire new catalog
containing the updated stream needs to be sent.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WebBackendConnectionUpdate,
      },
    ],
    response: WebBackendConnectionRead,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/web_backend/geographies/list",
    description: `Returns all available geographies in which a data sync can run.`,
    requestFormat: "json",
    response: WebBackendGeographiesListResult,
  },
  {
    method: "post",
    path: "/v1/web_backend/state/get_type",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ConnectionIdRequestBody,
      },
    ],
    response: z.enum(["global", "stream", "legacy", "not_set"]),
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/web_backend/workspace/state",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WebBackendWorkspaceState,
      },
    ],
    response: WebBackendWorkspaceStateResult,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/workspaces/create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkspaceCreate,
      },
    ],
    response: WorkspaceRead,
    errors: [
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/workspaces/delete",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkspaceIdRequestBody,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/workspaces/get",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkspaceIdRequestBody,
      },
    ],
    response: WorkspaceRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/workspaces/get_by_connection_id",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ConnectionIdRequestBody,
      },
    ],
    response: WorkspaceRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/workspaces/get_by_slug",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ slug: z.string() }),
      },
    ],
    response: WorkspaceRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/workspaces/list",
    requestFormat: "json",
    response: WorkspaceReadList,
  },
  {
    method: "post",
    path: "/v1/workspaces/tag_feedback_status_as_done",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkspaceGiveFeedback,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/workspaces/update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkspaceUpdate,
      },
    ],
    response: WorkspaceRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/v1/workspaces/update_name",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkspaceUpdateName,
      },
    ],
    response: WorkspaceRead,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
]);

export const api = new ZodiosCore(endpoints);
const result = api.post("/v1/connections/create", {
  body: {
    destinationId: "123",
    sourceId: "123",
    status: "active",
  },
});
