import { AppBridgeHelper } from '@ikas/app-helpers';
import crypto from 'crypto';

/** Key used for storing tokens in session storage */
const TOKEN_KEY = 'token';

/**
 * Utility class for managing authentication tokens in ikas applications.
 */
export class TokenHelpers {
  static getTokenForIframeApp = async (): Promise<string | null> => {
    // Sunucu tarafında (Server Component) çalışmasını engellemek için güvenlik kontrolü
    if (typeof window === 'undefined') return null;

    if (window.self !== window.top) {
      try {
        const authorizedAppId = (await AppBridgeHelper.getAuthorizedAppId()) || null;
        let token = sessionStorage.getItem(`${TOKEN_KEY}-${authorizedAppId}`);
        
        if (token) {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          if (new Date().getTime() < tokenData.exp * 1000) {
            return token;
          }
          sessionStorage.removeItem(`${TOKEN_KEY}-${authorizedAppId}`);
        }
        
        token = (await AppBridgeHelper.getNewToken()) || null;
        
        if (token) {
          sessionStorage.setItem(`${TOKEN_KEY}-${authorizedAppId}`, token);
          return token;
        }
        
      } catch (error) {
        console.error('Error retrieving token from AppBridge:', error);
      }
    }
    return null;
  };

  static setToken = async (params: URLSearchParams): Promise<void> => {
    const hasRequiredParams = params.has('token') && 
                              params.has('redirectUrl') && 
                              params.has('authorizedAppId');
    
    if (hasRequiredParams) {
      const token = params.get('token')!;
      const authorizedAppId = params.get('authorizedAppId')!;
      const redirectUrl = params.get('redirectUrl')!;
      
      sessionStorage.setItem(`${TOKEN_KEY}-${authorizedAppId}`, token);
      sessionStorage.setItem('authorizedAppId', authorizedAppId);
      
      window.location.replace(redirectUrl);
      throw 'redirectUrl-called';
    }
    
    // useRouter yerine tarayıcının kendi yönlendirmesini kullanıyoruz
    window.location.href = '/authorize-store';
  };

  static validateCodeSignature = (code: string, receivedSignature: string, secret: string): boolean => {
    const expectedSignature = crypto.createHmac('sha256', secret).update(code, 'utf8').digest('hex');
    return expectedSignature === receivedSignature;
  };
}