<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Stripe\Stripe;
use Stripe\Account;

class StripeConnection extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'Stripe:test-connection';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test to check connection';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        Stripe::setApiKey(config('stripe.secret'));
        try {
            $account = Account::retrieve();
            $this->info('Stripe connection successful. Account ID: ' . $account->id);
            $this->info('Account country: ' . $account->country);
            $this->info('Account type: ' . $account->type);
            return 0;
        } catch (\Exception $e) {
            $this->error('Stripe connection failed: ' . $e->getMessage());
            return 1;
        }
    }
}
