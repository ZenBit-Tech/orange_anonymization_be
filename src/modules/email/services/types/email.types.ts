export interface ContactFormPayload {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  company?: string;
}

export interface RequestMagicLinkParams {
  email: string;
  token: string;
}

export interface MagicLinkResponse {
  message: string;
}

export interface SendContactFormResponse {
  success: boolean;
  message: string;
}
