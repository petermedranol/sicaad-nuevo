<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RecaptchaService
{
    /**
     * Verify reCAPTCHA response with Google
     *
     * @param string $response
     * @param string|null $remoteIp
     * @return bool
     */
    public function verify(string $response, ?string $remoteIp = null): bool
    {
        $secretKey = config('recaptcha.secret_key');
        $verifyUrl = config('recaptcha.verify_url');

        if (empty($secretKey)) {
            Log::error('reCAPTCHA secret key not configured');
            return false;
        }

        if (empty($response)) {
            Log::warning('reCAPTCHA response is empty');
            return false;
        }

        try {
            $data = [
                'secret' => $secretKey,
                'response' => $response,
            ];

            if ($remoteIp) {
                $data['remoteip'] = $remoteIp;
            }

            $httpResponse = Http::asForm()->post($verifyUrl, $data);

            if (!$httpResponse->successful()) {
                Log::error('reCAPTCHA verification HTTP request failed', [
                    'status' => $httpResponse->status(),
                    'body' => $httpResponse->body()
                ]);
                return false;
            }

            $result = $httpResponse->json();

            if (!isset($result['success'])) {
                Log::error('reCAPTCHA response malformed', ['response' => $result]);
                return false;
            }

            if (!$result['success']) {
                Log::warning('reCAPTCHA verification failed', [
                    'error_codes' => $result['error-codes'] ?? []
                ]);
                return false;
            }

            Log::info('reCAPTCHA verification successful');
            return true;

        } catch (\Exception $e) {
            Log::error('reCAPTCHA verification exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Get reCAPTCHA site key
     *
     * @return string|null
     */
    public function getSiteKey(): ?string
    {
        return config('recaptcha.site_key');
    }
}

