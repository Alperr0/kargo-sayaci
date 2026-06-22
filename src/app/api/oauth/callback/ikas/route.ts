import { config } from '@/globals/config';
import { getSession, setSession } from '@/lib/session';
import { validateRequest } from '@/lib/validation';
import { OAuthAPI } from '@ikas/admin-api-client';
import moment from 'moment';
import { getIkas, getRedirectUri } from '@/helpers/api-helpers';
import { JwtHelpers } from '@/helpers/jwt-helpers';
import { TokenHelpers } from '@/helpers/token-helpers';
import { AuthToken } from '@/models/auth-token';
import { AuthTokenManager } from '@/models/auth-token/manager';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';

const callbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().optional(),
  signature: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url as string, `http://${request.headers.get('host')}`);
    const { searchParams } = url;

    const validation = validateRequest(callbackSchema, {
      code: searchParams.get('code'),
      state: searchParams.get('state') || undefined,
      signature: searchParams.get('signature') || undefined,
    });

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { code, state, signature } = validation.data;

    if (signature && !TokenHelpers.validateCodeSignature(code, signature, config.oauth.clientSecret!)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const session = await getSession();
    if (state && session.state && session.state !== state) {
      return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
    }

    const tokenResponse = await OAuthAPI.getTokenWithAuthorizationCode(
      {
        code: code as string,
        client_id: config.oauth.clientId!,
        client_secret: config.oauth.clientSecret!,
        redirect_uri: getRedirectUri(request.headers.get('host')!),
      },
      {
        storeName: (session.storeName || 'api') as string,
      },
    );

    if (!tokenResponse.data) {
      return NextResponse.json({ error: { statusCode: 500, message: 'Failed to retrieve token' } }, { status: 500 });
    }

    const tokenTemp: Partial<AuthToken> = {
      accessToken: tokenResponse.data.access_token,
      refreshToken: tokenResponse.data.refresh_token,
      tokenType: tokenResponse.data.token_type,
      expiresIn: tokenResponse.data.expires_in,
      expireDate: '',
      scope: tokenResponse.data.scope,
      salesChannelId: null,
    };

    const ikas = getIkas(tokenTemp as AuthToken);

    const [merchantResponse, authorizedAppResponse] = await Promise.all([ikas.queries.getMerchant(), ikas.queries.getAuthorizedApp()]);

    if (
      !merchantResponse.isSuccess ||
      !merchantResponse.data ||
      !authorizedAppResponse.isSuccess ||
      !authorizedAppResponse.data ||
      !authorizedAppResponse.data.getAuthorizedApp ||
      !merchantResponse.data.getMerchant
    ) {
      return NextResponse.json(
        {
          error: { statusCode: 403, message: 'Unable to retrieve merchant or authorized app' },
        },
        { status: 403 },
      );
    }

    const authorizedAppId = authorizedAppResponse.data.getAuthorizedApp.id!;
    const merchantId = merchantResponse.data.getMerchant.id!;
    const expireDate = moment().add(tokenResponse.data.expires_in, 'seconds').toDate().toISOString();

    const token: AuthToken = {
      ...tokenTemp,
      id: authorizedAppId,
      authorizedAppId,
      merchantId,
      expireDate,
      salesChannelId: authorizedAppResponse.data.getAuthorizedApp.salesChannelId || null,
    } as AuthToken;

    await AuthTokenManager.setToken(token.id, JSON.stringify(token));

    session.expiresAt = new Date(Date.now() + 3600 * 1000);
    session.merchantId = merchantId;
    session.authorizedAppId = authorizedAppId;
    delete session.state;

    await setSession(session);

    const redirectUrl = `${config.adminUrl!.replace(
      '{storeName}',
      merchantResponse.data.getMerchant.storeName as string,
    )}/authorized-app/${authorizedAppId}`;

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json({ error: { statusCode: 500, message: 'Callback failed' } }, { status: 500 });
  }
}