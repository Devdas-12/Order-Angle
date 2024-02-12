
import { Injectable } from '@angular/core';

declare var google: any;

@Injectable({
    providedIn: 'root',
})
export class GooglePayService {
    createGooglePayButton(onClickHandler: () => void): HTMLElement {
        const googlePayButton = document.createElement('button');
        googlePayButton.id = 'google-pay-button';
        googlePayButton.textContent = 'Buy with Google Pay';
        googlePayButton.addEventListener('click', onClickHandler);

        return googlePayButton;
    }

    isGooglePayAvailable(): boolean {
        // Implement logic to check if Google Pay is available.
        // You may need to handle this differently based on your integration.
        return true;
    }

    createGooglePayPaymentMethod(stripe : any, paymentIntent : any) {
        const googlePay = new google.payments.api.PaymentsClient({
            environment: 'TEST', // Change to 'PRODUCTION' for live environment
        });

        const paymentDataRequest = {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [
                {
                    type: 'CARD',
                    parameters: {
                        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                        allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA'],
                    },
                    tokenizationSpecification: {
                        type: 'PAYMENT_GATEWAY',
                        parameters: {
                            gateway: 'stripe',
                            stripe: {
                                publishableKey: 'your_stripe_publishable_key',
                            },
                        },
                    },
                },
            ],
            transactionInfo: {
                totalPriceStatus: 'FINAL',
                totalPrice: paymentIntent.amount / 100, // Convert to currency format if needed
                currencyCode: 'USD', // Change to your currency code
            },
            merchantInfo: {
                merchantName: 'Your Merchant Name',
            },
        };

        const paymentRequest = googlePay.createPaymentRequest(paymentDataRequest);

        googlePay.prefetchPaymentData(paymentDataRequest);

        return {
            googlePayButton: googlePay.createButton({
                buttonColor: 'default',
                buttonType: 'short',
                onClick: () => {
                    googlePay.loadPaymentData(paymentRequest).then((paymentData : any) => {
                        // Send the payment data to your server for confirmation
                        this.handleGooglePayPayment(stripe, paymentIntent, paymentData);
                    });
                },
            }),
        };
    }

    private handleGooglePayPayment(stripe : any, paymentIntent : any, paymentData : any) {
        // Implement logic to send the payment data to your server for confirmation.
        // This may involve creating a payment method or confirming the payment on the server side.
        // For example, you can use Angular's HttpClient to send a request to your server.

        // Sample implementation (replace with your server-side logic):
        // this.http.post('/handle-google-pay-payment', { paymentData, paymentIntent });

        // For testing, log the payment data and call confirmCardPayment on the client side.

        stripe.confirmCardPayment(paymentIntent.clientSecret, {
            payment_method: {
                card: paymentData.paymentMethodData.tokenizationData.token,
            },
        }).then((result : any) => {
            if (result.error) {
                console.error(result.error);
                // Handle payment failure
            } else {
                // Handle payment success
                console.log(result.paymentIntent);
            }
        });
    }
}
