import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EnquiryRequest, EnquiryResponse } from './enquiry.models';

type EnquiryBridgeMessage = {
  channel: 'destech-enquiry-response';
  nonce: string;
  response: EnquiryResponse;
};

@Injectable({ providedIn: 'root' })
export class EnquiryService {
  submit(request: EnquiryRequest): Observable<EnquiryResponse> {
    return new Observable((subscriber) => {
      const endpoint = environment.googleAppsScriptUrl.trim();
      if (!endpoint || !/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(endpoint)) {
        subscriber.error(new Error('ENQUIRY_ENDPOINT_NOT_CONFIGURED'));
        return;
      }

      const nonce = this.createNonce();
      const frameName = `destech-enquiry-${nonce}`;
      const iframe = document.createElement('iframe');
      iframe.name = frameName;
      iframe.title = 'Enquiry submission response';
      iframe.hidden = true;

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = endpoint;
      form.target = frameName;
      form.hidden = true;

      this.addField(form, 'payload', JSON.stringify(request));
      this.addField(form, 'nonce', nonce);

      const timeout = window.setTimeout(() => {
        subscriber.error(new Error('ENQUIRY_RESPONSE_TIMEOUT'));
      }, 45_000);

      const receiveMessage = (event: MessageEvent): void => {
        if (!this.isAppsScriptOrigin_(event.origin) || typeof event.data !== 'string') return;

        let message: EnquiryBridgeMessage;
        try {
          message = JSON.parse(event.data) as EnquiryBridgeMessage;
        } catch {
          return;
        }

        if (
          !message ||
          message.channel !== 'destech-enquiry-response' ||
          message.nonce !== nonce ||
          typeof message.response?.saved !== 'boolean' ||
          typeof message.response?.ok !== 'boolean'
        ) {
          return;
        }

        subscriber.next(message.response);
        subscriber.complete();
      };

      window.addEventListener('message', receiveMessage);
      document.body.append(iframe, form);
      form.submit();

      return () => {
        window.clearTimeout(timeout);
        window.removeEventListener('message', receiveMessage);
        form.remove();
        iframe.remove();
      };
    });
  }

  private addField(form: HTMLFormElement, name: string, value: string): void {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.append(input);
  }

  private isAppsScriptOrigin_(origin: string): boolean {
    return /^https:\/\/(?:script\.google\.com|(?:[a-z0-9-]+-)?script\.googleusercontent\.com)$/.test(
      origin,
    );
  }

  private createNonce(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
}
