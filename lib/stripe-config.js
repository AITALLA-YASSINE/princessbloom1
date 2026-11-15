// Do not log Stripe messages verbatim: authentication errors can contain keys.
function cleanKey(value) {
  return String(value || '').trim().replace(/^(['"])([\s\S]*)\1$/, '$2').trim();
}

function getStripeSecretKey(env = process.env) {
  const key = cleanKey(env.STRIPE_SECRET_KEY);
  const fail = code => { const error = new Error(code); error.code = code; throw error; };
  if (!key) fail('stripe_secret_missing');
  const secret = key.match(/^(?:sk|rk)_(test|live)_[A-Za-z0-9]+$/);
  if (!secret) fail('stripe_secret_invalid');
  const publicKey = cleanKey(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const publishable = publicKey.match(/^pk_(test|live)_[A-Za-z0-9]+$/);
  if (publicKey && !publishable) fail('stripe_public_invalid');
  if (publishable && secret[1] !== publishable[1]) fail('stripe_mode_mismatch');
  return key;
}

function stripeFailure(error) {
  const configurationCodes = ['stripe_secret_missing', 'stripe_secret_invalid', 'stripe_public_invalid', 'stripe_mode_mismatch'];
  let code = configurationCodes.includes(error?.code) ? error.code : 'stripe_request_failed';
  if (error?.type === 'StripeAuthenticationError') code = 'stripe_authentication_failed';
  if (error?.type === 'StripePermissionError') code = 'stripe_permission_denied';
  if (error?.type === 'StripeInvalidRequestError') code = 'stripe_invalid_request';
  if (error?.type === 'StripeConnectionError') code = 'stripe_connection_failed';
  const safeToken = value => typeof value === 'string' && /^[a-zA-Z0-9_.\[\]-]{1,100}$/.test(value) && !/^(?:sk|pk|rk)_/.test(value) ? value : undefined;
  console.error('Stripe payment preparation failed', { code, type: safeToken(error?.type), stripeCode: safeToken(error?.code), param: safeToken(error?.param), requestId: safeToken(error?.requestId) });
  return { status: code === 'stripe_invalid_request' || code === 'stripe_request_failed' ? 502 : 503, body: { error: 'Le paiement est momentanément indisponible. Veuillez réessayer dans quelques instants ou contacter notre service client.', code } };
}

module.exports = { getStripeSecretKey, stripeFailure };
