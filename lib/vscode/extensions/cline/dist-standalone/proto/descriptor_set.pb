
�
common.protocline"

Metadata";
EmptyRequest+
metadata (2.cline.MetadataRmetadata"
Empty"R
StringRequest+
metadata (2.cline.MetadataRmetadata
value (	Rvalue"W
StringArrayRequest+
metadata (2.cline.MetadataRmetadata
value (	Rvalue"
String
value (	Rvalue"Q
Int64Request+
metadata (2.cline.MetadataRmetadata
value (Rvalue"
Int64
value (Rvalue"Q
BytesRequest+
metadata (2.cline.MetadataRmetadata
value (Rvalue"
Bytes
value (Rvalue"S
BooleanRequest+
metadata (2.cline.MetadataRmetadata
value (Rvalue"
Boolean
value (Rvalue"%
StringArray
values (	Rvalues"B
StringArrays
values1 (	Rvalues1
values2 (	Rvalues2"6
KeyValuePair
key (	Rkey
value (	RvalueB
bot.cline.protoPbproto3
�
account.protoclinecommon.proto2�
AccountService9
accountLoginClicked.cline.EmptyRequest.cline.String9
accountLogoutClicked.cline.EmptyRequest.cline.Empty?
subscribeToAuthCallback.cline.EmptyRequest.cline.String0B
bot.cline.protoPbproto3
�
browser.protoclinecommon.proto"y
BrowserConnectionInfo!
is_connected (RisConnected
	is_remote (RisRemote
host (	H Rhost�B
_host"u
BrowserConnection
success (Rsuccess
message (	Rmessage
endpoint (	H Rendpoint�B
	_endpoint"?

ChromePath
path (	Rpath

is_bundled (R	isBundled"8
Viewport
width (Rwidth
height (Rheight"�
BrowserSettings+
viewport (2.cline.ViewportRviewport3
remote_browser_host (	H RremoteBrowserHost�9
remote_browser_enabled (HRremoteBrowserEnabled�9
chrome_executable_path (	HRchromeExecutablePath�-
disable_tool_use (HRdisableToolUse�B
_remote_browser_hostB
_remote_browser_enabledB
_chrome_executable_pathB
_disable_tool_use"�
UpdateBrowserSettingsRequest+
metadata (2.cline.MetadataRmetadata+
viewport (2.cline.ViewportRviewport3
remote_browser_host (	H RremoteBrowserHost�9
remote_browser_enabled (HRremoteBrowserEnabled�9
chrome_executable_path (	HRchromeExecutablePath�-
disable_tool_use (HRdisableToolUse�B
_remote_browser_hostB
_remote_browser_enabledB
_chrome_executable_pathB
_disable_tool_use2�
BrowserServiceM
getBrowserConnectionInfo.cline.EmptyRequest.cline.BrowserConnectionInfoG
testBrowserConnection.cline.StringRequest.cline.BrowserConnection@
discoverBrowser.cline.EmptyRequest.cline.BrowserConnection?
getDetectedChromePath.cline.EmptyRequest.cline.ChromePathL
updateBrowserSettings#.cline.UpdateBrowserSettingsRequest.cline.Boolean=
relaunchChromeDebugMode.cline.EmptyRequest.cline.StringB
bot.cline.protoPbproto3
�
checkpoints.protoclinecommon.proto"�
CheckpointRestoreRequest+
metadata (2.cline.MetadataRmetadata
number (Rnumber!
restore_type (	RrestoreType
offset (H Roffset�B	
_offset2�
CheckpointsService3
checkpointDiff.cline.Int64Request.cline.EmptyB
checkpointRestore.cline.CheckpointRestoreRequest.cline.EmptyB
bot.cline.protoPbproto3
�

file.protoclinecommon.proto"�
RefreshedRulesU
global_cline_rules_toggles (2.cline.ClineRulesTogglesRglobalClineRulesTogglesS
local_cline_rules_toggles (2.cline.ClineRulesTogglesRlocalClineRulesTogglesU
local_cursor_rules_toggles (2.cline.ClineRulesTogglesRlocalCursorRulesTogglesY
local_windsurf_rules_toggles (2.cline.ClineRulesTogglesRlocalWindsurfRulesTogglesN
local_workflow_toggles (2.cline.ClineRulesTogglesRlocalWorkflowTogglesP
global_workflow_toggles (2.cline.ClineRulesTogglesRglobalWorkflowToggles"
ToggleWindsurfRuleRequest+
metadata (2.cline.MetadataRmetadata
	rule_path (	RrulePath
enabled (Renabled"W
RelativePathsRequest+
metadata (2.cline.MetadataRmetadata
uris (	Ruris"%
RelativePaths
paths (	Rpaths"�
FileSearchRequest+
metadata (2.cline.MetadataRmetadata
query (	Rquery3
mentions_request_id (	H RmentionsRequestId�
limit (HRlimit�B
_mentions_request_idB
_limit"�
FileSearchResults)
results (2.cline.FileInfoRresults3
mentions_request_id (	H RmentionsRequestId�B
_mentions_request_id"W
FileInfo
path (	Rpath
type (	Rtype
label (	H Rlabel�B
_label"8

GitCommits*
commits (2.cline.GitCommitRcommits"�
	GitCommit
hash (	Rhash

short_hash (	R	shortHash
subject (	Rsubject
author (	Rauthor
date (	Rdate"�
RuleFileRequest+
metadata (2.cline.MetadataRmetadata
	is_global (RisGlobal 
	rule_path (	H RrulePath�
filename (	HRfilename�
type (	HRtype�B

_rule_pathB
	_filenameB
_type"q
RuleFile
	file_path (	RfilePath!
display_name (	RdisplayName%
already_exists (RalreadyExists"�
ToggleClineRuleRequest+
metadata (2.cline.MetadataRmetadata
	is_global (RisGlobal
	rule_path (	RrulePath
enabled (Renabled"�
ClineRulesToggles?
toggles (2%.cline.ClineRulesToggles.TogglesEntryRtoggles:
TogglesEntry
key (	Rkey
value (Rvalue:8"�
ToggleClineRulesU
global_cline_rules_toggles (2.cline.ClineRulesTogglesRglobalClineRulesTogglesS
local_cline_rules_toggles (2.cline.ClineRulesTogglesRlocalClineRulesToggles"}
ToggleCursorRuleRequest+
metadata (2.cline.MetadataRmetadata
	rule_path (	RrulePath
enabled (Renabled"�
ToggleWorkflowRequest+
metadata (2.cline.MetadataRmetadata#
workflow_path (	RworkflowPath
enabled (Renabled
	is_global (RisGlobal2�
FileService5
copyToClipboard.cline.StringRequest.cline.Empty.
openFile.cline.StringRequest.cline.Empty/
	openImage.cline.StringRequest.cline.Empty1
openMention.cline.StringRequest.cline.Empty9
deleteRuleFile.cline.RuleFileRequest.cline.RuleFile9
createRuleFile.cline.RuleFileRequest.cline.RuleFile8
searchCommits.cline.StringRequest.cline.GitCommits7
selectImages.cline.EmptyRequest.cline.StringArray9
selectFiles.cline.BooleanRequest.cline.StringArraysE
getRelativePaths.cline.RelativePathsRequest.cline.RelativePathsA
searchFiles.cline.FileSearchRequest.cline.FileSearchResultsI
toggleClineRule.cline.ToggleClineRuleRequest.cline.ToggleClineRulesL
toggleCursorRule.cline.ToggleCursorRuleRequest.cline.ClineRulesTogglesP
toggleWindsurfRule .cline.ToggleWindsurfRuleRequest.cline.ClineRulesToggles:
refreshRules.cline.EmptyRequest.cline.RefreshedRules5
openTaskHistory.cline.StringRequest.cline.EmptyH
toggleWorkflow.cline.ToggleWorkflowRequest.cline.ClineRulesTogglesH
subscribeToWorkspaceUpdates.cline.EmptyRequest.cline.StringArray0B
bot.cline.protoPbproto3
�
	mcp.protoclinecommon.proto"�
ToggleMcpServerRequest+
metadata (2.cline.MetadataRmetadata
server_name (	R
serverName
disabled (Rdisabled"�
UpdateMcpTimeoutRequest+
metadata (2.cline.MetadataRmetadata
server_name (	R
serverName
timeout (Rtimeout"�
AddRemoteMcpServerRequest+
metadata (2.cline.MetadataRmetadata
server_name (	R
serverName

server_url (	R	serverUrl"�
ToggleToolAutoApproveRequest+
metadata (2.cline.MetadataRmetadata
server_name (	R
serverName

tool_names (	R	toolNames!
auto_approve (RautoApprove"�
McpTool
name (	Rname%
description (	H Rdescription�&
input_schema (	HRinputSchema�&
auto_approve (HRautoApprove�B
_descriptionB
_input_schemaB
_auto_approve"�
McpResource
uri (	Ruri
name (	Rname 
	mime_type (	H RmimeType�%
description (	HRdescription�B

_mime_typeB
_description"�
McpResourceTemplate!
uri_template (	RuriTemplate
name (	Rname 
	mime_type (	H RmimeType�%
description (	HRdescription�B

_mime_typeB
_description"�
	McpServer
name (	Rname
config (	Rconfig.
status (2.cline.McpServerStatusRstatus
error (	H Rerror�$
tools (2.cline.McpToolRtools0
	resources (2.cline.McpResourceR	resourcesI
resource_templates (2.cline.McpResourceTemplateRresourceTemplates
disabled (HRdisabled�
timeout	 (HRtimeout�B
_errorB
	_disabledB

_timeout"?

McpServers1
mcp_servers (2.cline.McpServerR
mcpServers"�
McpMarketplaceItem
mcp_id (	RmcpId

github_url (	R	githubUrl
name (	Rname
author (	Rauthor 
description (	Rdescription!
codicon_icon (	RcodiconIcon
logo_url (	RlogoUrl
category (	Rcategory
tags	 (	Rtags(
requires_api_key
 (RrequiresApiKey*
readme_content (	H RreadmeContent�?
llms_installation_content (	HRllmsInstallationContent�%
is_recommended (RisRecommended!
github_stars (RgithubStars%
download_count (RdownloadCount

created_at (	R	createdAt

updated_at (	R	updatedAt(
last_github_sync (	RlastGithubSyncB
_readme_contentB
_llms_installation_content"H
McpMarketplaceCatalog/
items (2.cline.McpMarketplaceItemRitems*x
McpServerStatus"
MCP_SERVER_STATUS_DISCONNECTED 
MCP_SERVER_STATUS_CONNECTED 
MCP_SERVER_STATUS_CONNECTING2�

McpServiceC
toggleMcpServer.cline.ToggleMcpServerRequest.cline.McpServersE
updateMcpTimeout.cline.UpdateMcpTimeoutRequest.cline.McpServersI
addRemoteMcpServer .cline.AddRemoteMcpServerRequest.cline.McpServers1
downloadMcp.cline.StringRequest.cline.Empty;
restartMcpServer.cline.StringRequest.cline.McpServers:
deleteMcpServer.cline.StringRequest.cline.McpServersO
toggleToolAutoApprove#.cline.ToggleToolAutoApproveRequest.cline.McpServersJ
refreshMcpMarketplace.cline.EmptyRequest.cline.McpMarketplaceCatalog4
openMcpSettings.cline.EmptyRequest.cline.EmptyW
 subscribeToMcpMarketplaceCatalog.cline.EmptyRequest.cline.McpMarketplaceCatalog06
getLatestMcpServers.cline.Empty.cline.McpServersA
subscribeToMcpServers.cline.EmptyRequest.cline.McpServers0B
bot.cline.protoPbproto3
�
models.protoclinecommon.proto"C
VsCodeLmModelsArray,
models (2.cline.VsCodeLmModelRmodels"i
VsCodeLmModel
vendor (	Rvendor
family (	Rfamily
version (	Rversion
id (	Rid"B
	PriceTier
token_limit (R
tokenLimit
price (Rprice"�
ThinkingConfig"

max_budget (H R	maxBudget�&
output_price (HRoutputPrice�>
output_price_tiers (2.cline.PriceTierRoutputPriceTiersB
_max_budgetB
_output_price"�
	ModelTier%
context_window (RcontextWindow$
input_price (H R
inputPrice�&
output_price (HRoutputPrice�1
cache_writes_price (HRcacheWritesPrice�/
cache_reads_price (HRcacheReadsPrice�B
_input_priceB
_output_priceB
_cache_writes_priceB
_cache_reads_price"�
OpenRouterModelInfo"

max_tokens (H R	maxTokens�*
context_window (HRcontextWindow�,
supports_images (HRsupportsImages�2
supports_prompt_cache (RsupportsPromptCache$
input_price (HR
inputPrice�&
output_price (HRoutputPrice�1
cache_writes_price (HRcacheWritesPrice�/
cache_reads_price (HRcacheReadsPrice�%
description	 (	HRdescription�C
thinking_config
 (2.cline.ThinkingConfigHRthinkingConfig�=
supports_global_endpoint (H	RsupportsGlobalEndpoint�&
tiers (2.cline.ModelTierRtiersB
_max_tokensB
_context_windowB
_supports_imagesB
_input_priceB
_output_priceB
_cache_writes_priceB
_cache_reads_priceB
_descriptionB
_thinking_configB
_supports_global_endpoint"�
OpenRouterCompatibleModelInfoH
models (20.cline.OpenRouterCompatibleModelInfo.ModelsEntryRmodelsU
ModelsEntry
key (	Rkey0
value (2.cline.OpenRouterModelInfoRvalue:8"t
OpenAiModelsRequest+
metadata (2.cline.MetadataRmetadata
baseUrl (	RbaseUrl
apiKey (	RapiKey2�
ModelsService;
getOllamaModels.cline.StringRequest.cline.StringArray=
getLmStudioModels.cline.StringRequest.cline.StringArrayD
getVsCodeLmModels.cline.EmptyRequest.cline.VsCodeLmModelsArrayT
refreshOpenRouterModels.cline.EmptyRequest$.cline.OpenRouterCompatibleModelInfoE
refreshOpenAiModels.cline.OpenAiModelsRequest.cline.StringArrayR
refreshRequestyModels.cline.EmptyRequest$.cline.OpenRouterCompatibleModelInfoZ
subscribeToOpenRouterModels.cline.EmptyRequest$.cline.OpenRouterCompatibleModelInfo0B
bot.cline.protoPbproto3
�
slash.protoclinecommon.proto2o
SlashService/
	reportBug.cline.StringRequest.cline.Empty.
condense.cline.StringRequest.cline.EmptyB
bot.cline.protoPbproto3
�=
state.protoclinecommon.proto"&
State

state_json (	R	stateJson"�
TogglePlanActModeRequest+
metadata (2.cline.MetadataRmetadata8
chat_settings (2.cline.ChatSettingsRchatSettings:
chat_content (2.cline.ChatContentH RchatContent�B
_chat_content"�
ChatSettings&
mode (2.cline.PlanActModeRmode2
preferred_language (	H RpreferredLanguage�<
open_ai_reasoning_effort (	HRopenAiReasoningEffort�B
_preferred_languageB
_open_ai_reasoning_effort"f
ChatContent
message (	H Rmessage�
images (	Rimages
files (	RfilesB

_message"�
AutoApprovalSettingsRequest+
metadata (2.cline.MetadataRmetadata
version (Rversion
enabled (RenabledD
actions (2*.cline.AutoApprovalSettingsRequest.ActionsRactions!
max_requests (RmaxRequests1
enable_notifications (RenableNotifications
	favorites (	R	favorites�
Actions

read_files (R	readFiles2
read_files_externally (RreadFilesExternally

edit_files (R	editFiles2
edit_files_externally (ReditFilesExternally2
execute_safe_commands (RexecuteSafeCommands0
execute_all_commands (RexecuteAllCommands
use_browser (R
useBrowser
use_mcp (RuseMcp"�
UpdateSettingsRequest+
metadata (2.cline.MetadataRmetadataI
api_configuration (2.cline.ApiConfigurationH RapiConfiguration�C
custom_instructions_setting (	HRcustomInstructionsSetting�0
telemetry_setting (	HRtelemetrySetting�K
 plan_act_separate_models_setting (HRplanActSeparateModelsSetting�A
enable_checkpoints_setting (HRenableCheckpointsSetting�;
mcp_marketplace_enabled (HRmcpMarketplaceEnabled�=
chat_settings (2.cline.ChatSettingsHRchatSettings�?
shell_integration_timeout	 (HRshellIntegrationTimeout�9
terminal_reuse_enabled
 (HRterminalReuseEnabled�;
mcp_responses_collapsed (H	RmcpResponsesCollapsed�B
_api_configurationB
_custom_instructions_settingB
_telemetry_settingB#
!_plan_act_separate_models_settingB
_enable_checkpoints_settingB
_mcp_marketplace_enabledB
_chat_settingsB
_shell_integration_timeoutB
_terminal_reuse_enabledB
_mcp_responses_collapsed"�'
ApiConfiguration&
api_provider (	H RapiProvider�%
api_model_id (	HR
apiModelId�
api_key (	HRapiKey�%
api_base_url (	HR
apiBaseUrl�'
cline_api_key (	HRclineApiKey�1
openrouter_api_key (	HRopenrouterApiKey�1
anthropic_base_url (	HRanthropicBaseUrl�)
openai_api_key (	HRopenaiApiKey�6
openai_native_api_key	 (	HRopenaiNativeApiKey�)
gemini_api_key
 (	H	RgeminiApiKey�-
deepseek_api_key (	H
RdeepseekApiKey�-
requesty_api_key (	HRrequestyApiKey�-
together_api_key (	HRtogetherApiKey�/
fireworks_api_key (	HRfireworksApiKey�%
qwen_api_key (	HR
qwenApiKey�)
doubao_api_key (	HRdoubaoApiKey�+
mistral_api_key (	HRmistralApiKey�)
nebius_api_key (	HRnebiusApiKey�+
asksage_api_key (	HRasksageApiKey�#
xai_api_key (	HR	xaiApiKey�/
sambanova_api_key (	HRsambanovaApiKey�-
cerebras_api_key (	HRcerebrasApiKey�3
openrouter_model_id (	HRopenrouterModelId�+
openai_model_id (	HRopenaiModelId�1
anthropic_model_id (	HRanthropicModelId�-
bedrock_model_id (	HRbedrockModelId�+
vertex_model_id (	HRvertexModelId�+
gemini_model_id (	HRgeminiModelId�+
ollama_model_id (	HRollamaModelId�0
lm_studio_model_id (	HRlmStudioModelId�-
litellm_model_id (	HRlitellmModelId�/
requesty_model_id  (	HRrequestyModelId�/
together_model_id! (	H RtogetherModelId�1
fireworks_model_id" (	H!RfireworksModelId�B
aws_bedrock_custom_selected# (H"RawsBedrockCustomSelected�J
 aws_bedrock_custom_model_base_id$ (	H#RawsBedrockCustomModelBaseId�)
aws_access_key% (	H$RawsAccessKey�)
aws_secret_key& (	H%RawsSecretKey�/
aws_session_token' (	H&RawsSessionToken�"

aws_region( (	H'R	awsRegion�G
aws_use_cross_region_inference) (H(RawsUseCrossRegionInference�C
aws_bedrock_use_prompt_cache* (H)RawsBedrockUsePromptCache�+
aws_use_profile+ (H*RawsUseProfile�$
aws_profile, (	H+R
awsProfile�5
aws_bedrock_endpoint- (	H,RawsBedrockEndpoint�/
vertex_project_id. (	H-RvertexProjectId�(
vertex_region/ (	H.RvertexRegion�+
openai_base_url0 (	H/RopenaiBaseUrl�+
ollama_base_url1 (	H0RollamaBaseUrl�0
lm_studio_base_url2 (	H1RlmStudioBaseUrl�+
gemini_base_url3 (	H2RgeminiBaseUrl�-
litellm_base_url4 (	H3RlitellmBaseUrl�+
asksage_api_url5 (	H4RasksageApiUrl�+
litellm_api_key6 (	H5RlitellmApiKey�<
litellm_use_prompt_cache7 (H6RlitellmUsePromptCache�9
thinking_budget_tokens8 (H7RthinkingBudgetTokens�.
reasoning_effort9 (	H8RreasoningEffort�1
request_timeout_ms: (H9RrequestTimeoutMs�U
%fireworks_model_max_completion_tokens; (H:R!fireworksModelMaxCompletionTokens�@
fireworks_model_max_tokens< (H;RfireworksModelMaxTokens�/
azure_api_version= (	H<RazureApiVersion�?
ollama_api_options_ctx_num> (	H=RollamaApiOptionsCtxNum�'
qwen_api_line? (	H>RqwenApiLine�C
openrouter_provider_sorting@ (	H?RopenrouterProviderSorting�<
vscode_lm_model_selectorA (	H@RvscodeLmModelSelector�7
openrouter_model_infoB (	HARopenrouterModelInfo�/
openai_model_infoC (	HBRopenaiModelInfo�3
requesty_model_infoD (	HCRrequestyModelInfo�1
litellm_model_infoE (	HDRlitellmModelInfo�*
openai_headersF (	HERopenaiHeaders�.
favorited_model_idsG (	RfavoritedModelIdsB
_api_providerB
_api_model_idB

_api_keyB
_api_base_urlB
_cline_api_keyB
_openrouter_api_keyB
_anthropic_base_urlB
_openai_api_keyB
_openai_native_api_keyB
_gemini_api_keyB
_deepseek_api_keyB
_requesty_api_keyB
_together_api_keyB
_fireworks_api_keyB
_qwen_api_keyB
_doubao_api_keyB
_mistral_api_keyB
_nebius_api_keyB
_asksage_api_keyB
_xai_api_keyB
_sambanova_api_keyB
_cerebras_api_keyB
_openrouter_model_idB
_openai_model_idB
_anthropic_model_idB
_bedrock_model_idB
_vertex_model_idB
_gemini_model_idB
_ollama_model_idB
_lm_studio_model_idB
_litellm_model_idB
_requesty_model_idB
_together_model_idB
_fireworks_model_idB
_aws_bedrock_custom_selectedB#
!_aws_bedrock_custom_model_base_idB
_aws_access_keyB
_aws_secret_keyB
_aws_session_tokenB
_aws_regionB!
_aws_use_cross_region_inferenceB
_aws_bedrock_use_prompt_cacheB
_aws_use_profileB
_aws_profileB
_aws_bedrock_endpointB
_vertex_project_idB
_vertex_regionB
_openai_base_urlB
_ollama_base_urlB
_lm_studio_base_urlB
_gemini_base_urlB
_litellm_base_urlB
_asksage_api_urlB
_litellm_api_keyB
_litellm_use_prompt_cacheB
_thinking_budget_tokensB
_reasoning_effortB
_request_timeout_msB(
&_fireworks_model_max_completion_tokensB
_fireworks_model_max_tokensB
_azure_api_versionB
_ollama_api_options_ctx_numB
_qwen_api_lineB
_openrouter_provider_sortingB
_vscode_lm_model_selectorB
_openrouter_model_infoB
_openai_model_infoB
_requesty_model_infoB
_litellm_model_infoB
_openai_headers* 
PlanActMode
PLAN 
ACT2�
StateService3
getLatestState.cline.EmptyRequest.cline.State7
subscribeToState.cline.EmptyRequest.cline.State09
toggleFavoriteModel.cline.StringRequest.cline.Empty/

resetState.cline.EmptyRequest.cline.EmptyB
togglePlanActMode.cline.TogglePlanActModeRequest.cline.EmptyN
updateAutoApprovalSettings".cline.AutoApprovalSettingsRequest.cline.Empty<
updateSettings.cline.UpdateSettingsRequest.cline.EmptyB
bot.cline.protoPbproto3
�

task.protoclinecommon.proto"
NewTaskRequest+
metadata (2.cline.MetadataRmetadata
text (	Rtext
images (	Rimages
files (	Rfiles"~
TaskFavoriteRequest+
metadata (2.cline.MetadataRmetadata
task_id (	RtaskId!
is_favorited (RisFavorited"�
TaskResponse
id (	Rid
task (	Rtask
ts (Rts!
is_favorited (RisFavorited
size (Rsize

total_cost (R	totalCost
	tokens_in (RtokensIn

tokens_out (R	tokensOut!
cache_writes	 (RcacheWrites
cache_reads
 (R
cacheReads"n
DeleteNonFavoritedTasksResults'
tasks_preserved (RtasksPreserved#
tasks_deleted (RtasksDeleted"�
GetTaskHistoryRequest+
metadata (2.cline.MetadataRmetadata%
favorites_only (RfavoritesOnly!
search_query (	RsearchQuery
sort_by (	RsortBy4
current_workspace_only (RcurrentWorkspaceOnly"Z
TaskHistoryArray%
tasks (2.cline.TaskItemRtasks
total_count (R
totalCount"�
TaskItem
id (	Rid
task (	Rtask
ts (Rts!
is_favorited (RisFavorited
size (Rsize

total_cost (R	totalCost
	tokens_in (RtokensIn

tokens_out (R	tokensOut!
cache_writes	 (RcacheWrites
cache_reads
 (R
cacheReads"�
AskResponseRequest+
metadata (2.cline.MetadataRmetadata#
response_type (	RresponseType
text (	Rtext
images (	Rimages
files (	Rfiles"u
ExecuteQuickWinRequest+
metadata (2.cline.MetadataRmetadata
command (	Rcommand
title (	Rtitle2�
TaskService/

cancelTask.cline.EmptyRequest.cline.Empty.
	clearTask.cline.EmptyRequest.cline.Empty6
getTotalTasksSize.cline.EmptyRequest.cline.Int64=
deleteTasksWithIds.cline.StringArrayRequest.cline.Empty.
newTask.cline.NewTaskRequest.cline.Empty;
showTaskWithId.cline.StringRequest.cline.TaskResponse6
exportTaskWithId.cline.StringRequest.cline.Empty>
toggleTaskFavorite.cline.TaskFavoriteRequest.cline.EmptyU
deleteNonFavoritedTasks.cline.EmptyRequest%.cline.DeleteNonFavoritedTasksResultsG
getTaskHistory.cline.GetTaskHistoryRequest.cline.TaskHistoryArray6
askResponse.cline.AskResponseRequest.cline.Empty2
taskFeedback.cline.StringRequest.cline.Empty>
taskCompletionViewChanges.cline.Int64Request.cline.Empty>
executeQuickWin.cline.ExecuteQuickWinRequest.cline.EmptyB
bot.cline.protoPbproto3
�)
ui.protoclinecommon.proto"�
WebviewProviderTypeRequest+
metadata (2.cline.MetadataRmetadata>
providerType (2.cline.WebviewProviderTypeRproviderType"_
ConversationHistoryDeletedRange
start_index (R
startIndex
	end_index (RendIndex"�
ClineSayTool+
tool (2.cline.ClineSayToolTypeRtool
path (	Rpath
diff (	Rdiff
content (	Rcontent
regex (	Rregex!
file_pattern (	RfilePatternH
!operation_is_located_in_workspace (RoperationIsLocatedInWorkspace"y
ClineSayBrowserAction,
action (2.cline.BrowserActionRaction

coordinate (	R
coordinate
text (	Rtext"�
BrowserActionResult

screenshot (	R
screenshot
logs (	Rlogs
current_url (	R
currentUrl4
current_mouse_position (	RcurrentMousePosition"�
ClineAskUseMcpServer
server_name (	R
serverName/
type (2.cline.McpServerRequestTypeRtype
	tool_name (	RtoolName
	arguments (	R	arguments
uri (	Ruri"i
ClinePlanModeResponse
response (	Rresponse
options (	Roptions
selected (	Rselected"d
ClineAskQuestion
question (	Rquestion
options (	Roptions
selected (	Rselected"+
ClineAskNewTask
context (	Rcontext"�
ApiReqRetryStatus
attempt (Rattempt!
max_attempts (RmaxAttempts
	delay_sec (RdelaySec#
error_snippet (	RerrorSnippet"�
ClineApiReqInfo
request (	Rrequest
	tokens_in (RtokensIn

tokens_out (R	tokensOut!
cache_writes (RcacheWrites
cache_reads (R
cacheReads
cost (RcostC
cancel_reason (2.cline.ClineApiReqCancelReasonRcancelReason8
streaming_failed_message (	RstreamingFailedMessage;
retry_status	 (2.cline.ApiReqRetryStatusRretryStatus"�	
ClineMessage
ts (Rts+
type (2.cline.ClineMessageTypeRtype!
ask (2.cline.ClineAskRask!
say (2.cline.ClineSayRsay
text (	Rtext
	reasoning (	R	reasoning
images (	Rimages
files (	Rfiles
partial	 (Rpartial0
last_checkpoint_hash
 (	RlastCheckpointHash9
is_checkpoint_checked_out (RisCheckpointCheckedOutC
is_operation_outside_workspace (RisOperationOutsideWorkspace<
conversation_history_index (RconversationHistoryIndexs
"conversation_history_deleted_range (2&.cline.ConversationHistoryDeletedRangeRconversationHistoryDeletedRange.
say_tool (2.cline.ClineSayToolRsayToolJ
say_browser_action (2.cline.ClineSayBrowserActionRsayBrowserActionN
browser_action_result (2.cline.BrowserActionResultRbrowserActionResultH
ask_use_mcp_server (2.cline.ClineAskUseMcpServerRaskUseMcpServerJ
plan_mode_response (2.cline.ClinePlanModeResponseRplanModeResponse:
ask_question (2.cline.ClineAskQuestionRaskQuestion8
ask_new_task (2.cline.ClineAskNewTaskR
askNewTask8
api_req_info (2.cline.ClineApiReqInfoR
apiReqInfo*+
WebviewProviderType
SIDEBAR 
TAB*$
ClineMessageType
ASK 
SAY*�
ClineAsk
FOLLOWUP 
PLAN_MODE_RESPOND
COMMAND
COMMAND_OUTPUT
COMPLETION_RESULT
TOOL
API_REQ_FAILED
RESUME_TASK
RESUME_COMPLETED_TASK
MISTAKE_LIMIT_REACHED	!
AUTO_APPROVAL_MAX_REQ_REACHED

BROWSER_ACTION_LAUNCH
USE_MCP_SERVER
NEW_TASK
CONDENSE

REPORT_BUG*�
ClineSay
TASK 	
ERROR
API_REQ_STARTED
API_REQ_FINISHED
TEXT
	REASONING
COMPLETION_RESULT_SAY
USER_FEEDBACK
USER_FEEDBACK_DIFF
API_REQ_RETRIED	
COMMAND_SAY

COMMAND_OUTPUT_SAY
TOOL_SAY
SHELL_INTEGRATION_WARNING
BROWSER_ACTION_LAUNCH_SAY
BROWSER_ACTION
BROWSER_ACTION_RESULT
MCP_SERVER_REQUEST_STARTED
MCP_SERVER_RESPONSE
MCP_NOTIFICATION
USE_MCP_SERVER_SAY

DIFF_ERROR
DELETED_API_REQS
CLINEIGNORE_ERROR
CHECKPOINT_CREATED
LOAD_MCP_DOCUMENTATION
INFO*�
ClineSayToolType
EDITED_EXISTING_FILE 
NEW_FILE_CREATED
	READ_FILE
LIST_FILES_TOP_LEVEL
LIST_FILES_RECURSIVE
LIST_CODE_DEFINITION_NAMES
SEARCH_FILES
	WEB_FETCH*[
BrowserAction

LAUNCH 	
CLICK
TYPE
SCROLL_DOWN
	SCROLL_UP	
CLOSE*A
McpServerRequestType
USE_MCP_TOOL 
ACCESS_MCP_RESOURCE*Z
ClineApiReqCancelReason
STREAMING_FAILED 
USER_CANCELLED
RETRIES_EXHAUSTED2�
	UiService=
scrollToSettings.cline.StringRequest.cline.KeyValuePair<
onDidShowAnnouncement.cline.EmptyRequest.cline.Boolean=
subscribeToAddToInput.cline.EmptyRequest.cline.String0P
subscribeToMcpButtonClicked!.cline.WebviewProviderTypeRequest.cline.Empty0T
subscribeToHistoryButtonClicked!.cline.WebviewProviderTypeRequest.cline.Empty0C
subscribeToChatButtonClicked.cline.EmptyRequest.cline.Empty0F
subscribeToAccountButtonClicked.cline.EmptyRequest.cline.Empty0U
 subscribeToSettingsButtonClicked!.cline.WebviewProviderTypeRequest.cline.Empty0G
subscribeToPartialMessage.cline.EmptyRequest.cline.ClineMessage08
subscribeToTheme.cline.EmptyRequest.cline.String06
initializeWebview.cline.EmptyRequest.cline.EmptyC
subscribeToRelinquishControl.cline.EmptyRequest.cline.Empty0A
subscribeToFocusChatInput.cline.StringRequest.cline.Empty0B
bot.cline.protoPbproto3
�
	web.protoclinecommon.proto"9

IsImageUrl
is_image (RisImage
url (	Rurl"�
OpenGraphData
title (	Rtitle 
description (	Rdescription
image (	Rimage
url (	Rurl
	site_name (	RsiteName
type (	Rtype2�

WebService:
checkIsImageUrl.cline.StringRequest.cline.IsImageUrl@
fetchOpenGraphData.cline.StringRequest.cline.OpenGraphData3
openInBrowser.cline.StringRequest.cline.EmptyB
bot.cline.protoPbproto3
�
host/uri.protohostcommon.proto"�
Uri
scheme (	Rscheme
	authority (	R	authority
path (	Rpath
query (	Rquery
fragment (	Rfragment
fsPath (	RfsPath"�
JoinPathRequest+
metadata (2.cline.MetadataRmetadata
base (2	.host.UriRbase"
pathSegments (	RpathSegments2�

UriService'
file.cline.StringRequest	.host.Uri,
joinPath.host.JoinPathRequest	.host.Uri(
parse.cline.StringRequest	.host.UriB
bot.cline.host.protoPbproto3
�
host/watch.protohostcommon.proto"Y
SubscribeToFileRequest+
metadata (2.cline.MetadataRmetadata
path (	Rpath"�
FileChangeEvent
path (	Rpath4
type (2 .host.FileChangeEvent.ChangeTypeRtype
content (	Rcontent"3

ChangeType
CREATED 
CHANGED
DELETED2X
WatchServiceH
subscribeToFile.host.SubscribeToFileRequest.host.FileChangeEvent0B
bot.cline.host.protoPbproto3