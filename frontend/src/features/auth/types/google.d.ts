/**
 * TypeScript declarations for Google Identity Services SDK.
 * These types define the global `google` object and its methods for One Tap authentication.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          /**
           * Initializes Google Identity Services with the specified configuration.
           * Must be called before displaying One Tap prompt or button.
           */
          initialize: (config: GoogleIdentityConfig) => void;

          /**
           * Displays the One Tap prompt to the user.
           * The prompt will automatically appear in the corner of the page.
           */
          prompt: (momentListener?: (notification: PromptMomentNotification) => void) => void;

          /**
           * Renders a Google Sign-In button in the specified container.
           */
          renderButton: (
            parent: HTMLElement,
            options: GoogleButtonConfig,
            clickHandler?: () => void,
          ) => void;

          /**
           * Cancels the One Tap prompt if it is currently displayed.
           */
          cancel: () => void;

          /**
           * Revokes the user's consent and clears any cached credentials.
           */
          revoke: (hint: string, callback?: (response: RevocationResponse) => void) => void;

          /**
           * Disables auto-select for the One Tap flow.
           */
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

/**
 * Configuration options for Google Identity Services initialization.
 */
export interface GoogleIdentityConfig {
  /** Your Google API client ID */
  client_id: string;

  /** Callback function called when user successfully authenticates */
  callback: (response: CredentialResponse) => void;

  /** Enable automatic selection if only one Google account is available */
  auto_select?: boolean;

  /** Cancel One Tap when user clicks outside the prompt */
  cancel_on_tap_outside?: boolean;

  /** The DOM ID of the One Tap prompt container */
  prompt_parent_id?: string;

  /** The title of the One Tap prompt */
  context?: 'signin' | 'signup' | 'use';

  /** The URIs that are allowed to be the Referrer-Policy */
  ux_mode?: 'popup' | 'redirect';

  /** Override the default redirect URI */
  login_uri?: string;

  /** Enable Federated Credential Management API */
  use_fedcm_for_prompt?: boolean;

  /** Nonce to use for ID token verification */
  nonce?: string;

  /** State parameter for OAuth flow */
  state?: string;

  /** Intermediate iframe close callback */
  intermediate_iframe_close_callback?: () => void;

  /** Controls sign-in with Google button */
  itp_support?: boolean;
}

/**
 * Response object passed to the callback when user authenticates.
 */
export interface CredentialResponse {
  /** The ID Token (JWT) from Google containing user identity information */
  credential: string;

  /** How the credential was selected */
  select_by:
    | 'auto'
    | 'user'
    | 'user_1tap'
    | 'user_2tap'
    | 'btn'
    | 'btn_confirm'
    | 'btn_add_session'
    | 'btn_confirm_add_session';

  /** Client ID used for the request */
  clientId?: string;
}

/**
 * Notification about the One Tap prompt display state.
 */
export interface PromptMomentNotification {
  /** Returns true if the prompt was displayed */
  isDisplayed: () => boolean;

  /** Returns true if the prompt was not displayed */
  isNotDisplayed: () => boolean;

  /** Returns true if the prompt was skipped */
  isSkippedMoment: () => boolean;

  /** Returns true if the prompt was dismissed */
  isDismissedMoment: () => boolean;

  /** Returns the reason why the prompt was not displayed */
  getNotDisplayedReason: () =>
    | 'browser_not_supported'
    | 'invalid_client'
    | 'missing_client_id'
    | 'opt_out_or_no_session'
    | 'secure_http_required'
    | 'suppressed_by_user'
    | 'unregistered_origin'
    | 'unknown_reason';

  /** Returns the reason why the prompt was skipped */
  getSkippedReason: () => 'auto_cancel' | 'user_cancel' | 'tap_outside' | 'issuing_failed';

  /** Returns the reason why the prompt was dismissed */
  getDismissedReason: () =>
    | 'credential_returned'
    | 'cancel_called'
    | 'flow_restarted';

  /** Returns the moment type */
  getMomentType: () => 'display' | 'skipped' | 'dismissed';
}

/**
 * Configuration for the Google Sign-In button.
 */
export interface GoogleButtonConfig {
  /** Button type */
  type?: 'standard' | 'icon';

  /** Button theme */
  theme?: 'outline' | 'filled_blue' | 'filled_black';

  /** Button size */
  size?: 'large' | 'medium' | 'small';

  /** Button text */
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';

  /** Button shape */
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';

  /** Logo alignment */
  logo_alignment?: 'left' | 'center';

  /** Button width in pixels */
  width?: number;

  /** Locale for button text */
  locale?: string;
}

/**
 * Response from revoke operation.
 */
export interface RevocationResponse {
  /** Whether the revocation was successful */
  successful: boolean;

  /** Error message if revocation failed */
  error?: string;
}

export {};
