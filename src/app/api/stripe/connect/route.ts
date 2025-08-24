import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, refreshUrl, returnUrl } = body;
    
    const stripe = getStripe();
    
    if (accountId) {
      // Create account link for existing account
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl || `${process.env.NEXTAUTH_URL}/onboarding/start`,
        return_url: returnUrl || `${process.env.NEXTAUTH_URL}/onboarding/done`,
        type: 'account_onboarding',
      });
      
      return NextResponse.json({
        url: accountLink.url,
        accountId
      });
    } else {
      // Create new Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: body.country || 'US',
        email: body.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: body.businessType || 'individual',
        ...(body.businessProfile && {
          business_profile: {
            name: body.businessProfile.name,
            product_description: body.businessProfile.productDescription,
            support_email: body.businessProfile.supportEmail,
            url: body.businessProfile.url,
          }
        })
      });
      
      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: refreshUrl || `${process.env.NEXTAUTH_URL}/onboarding/start`,
        return_url: returnUrl || `${process.env.NEXTAUTH_URL}/onboarding/done`,
        type: 'account_onboarding',
      });
      
      return NextResponse.json({
        url: accountLink.url,
        accountId: account.id
      });
    }
      } catch (error: unknown) {
      console.error('Stripe Connect error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to create Stripe Connect account',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }
    
    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(accountId);
    
    return NextResponse.json({
      id: account.id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      country: account.country,
      defaultCurrency: account.default_currency,
      email: account.email,
      type: account.type,
      businessProfile: account.business_profile,
      requirements: account.requirements,
    });
  } catch (error: unknown) {
    console.error('Stripe account retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve Stripe account',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}