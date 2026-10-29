import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators, type AbstractControl } from '@angular/forms';
import { site, copy } from '../../../content/site.config';
import { IconComponent } from '../../shared/icon.component';
import { RevealDirective } from '../../shared/reveal.directive';
import { solveChallenge } from '../../../lib/proof-of-work';

type FormState = 'idle' | 'sending' | 'sent' | 'error';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

@Component({
  selector: 'pf-contact',
  imports: [ReactiveFormsModule, IconComponent, RevealDirective],
  template: `
    <section class="section contact" id="contact" aria-labelledby="contact-title">
      <div class="container contact-grid">
        <div class="contact-copy" pfReveal>
          <h2 id="contact-title">{{ title }}</h2>
          <p>{{ lead }}</p>
          <div class="contact-actions">
            @if (c.email) {
              <a class="btn btn--primary" [href]="'mailto:' + c.email"><pf-icon name="mail" />{{ c.email }}</a>
              <button class="btn copy-btn" type="button" aria-label="Copy email address" (click)="copyEmail()">
                <pf-icon [name]="copied() === 'Copied' ? 'check' : 'copy'" />
              </button>
              <span class="copy-feedback mono" role="status">{{ copied() }}</span>
            }
            @if (c.github) {
              <a class="btn" [href]="c.github" target="_blank" rel="me noopener"><pf-icon name="github" />GitHub</a>
            }
            @if (c.linkedin) {
              <a class="btn" [href]="c.linkedin" target="_blank" rel="me noopener"><pf-icon name="linkedin" />LinkedIn</a>
            }
            @if (c.resume) {
              <a class="btn" [href]="c.resume" download><pf-icon name="file-text" />Résumé (PDF)</a>
            }
          </div>
        </div>

        @if (c.formEndpoint) {
          <form class="contact-form" [formGroup]="form" (ngSubmit)="submit()" (focusin)="startProof()" novalidate pfReveal>
            <h3>Send a message</h3>
            <div class="field">
              <label for="cf-name">Name</label>
              <input id="cf-name" formControlName="name" type="text" autocomplete="name" maxlength="100"
                     aria-describedby="cf-name-err" [attr.aria-invalid]="invalid('name')" />
              <span class="field-error" id="cf-name-err">{{ invalid('name') ? 'Enter your name.' : '' }}</span>
            </div>
            <div class="field">
              <label for="cf-email">Email</label>
              <input id="cf-email" formControlName="email" type="email" autocomplete="email" maxlength="200"
                     aria-describedby="cf-email-err" [attr.aria-invalid]="invalid('email')" />
              <span class="field-error" id="cf-email-err">{{ invalid('email') ? 'Enter an email address like name@example.com.' : '' }}</span>
            </div>
            <div class="field">
              <label for="cf-message">Message</label>
              <textarea id="cf-message" formControlName="message" maxlength="5000"
                        aria-describedby="cf-message-err" [attr.aria-invalid]="invalid('message')"></textarea>
              <span class="field-error" id="cf-message-err">{{ invalid('message') ? 'Write a message of at least 10 characters.' : '' }}</span>
            </div>
            <div class="hp" aria-hidden="true">
              <label for="cf-website">Leave this empty</label>
              <input id="cf-website" formControlName="website" type="text" tabindex="-1" autocomplete="off" />
            </div>
            <button class="btn btn--primary" type="submit" [disabled]="state() === 'sending'">
              @if (state() === 'sending') {
                <span class="spinner" aria-hidden="true"></span><span>Sending…</span>
              } @else {
                <pf-icon name="send" /><span>Send message</span>
              }
            </button>
            <p class="form-status" role="status" aria-live="polite"
               [class.is-success]="state() === 'sent'" [class.is-error]="state() === 'error'">{{ status() }}</p>
            <p class="form-note">Your details are used only to reply to you. Spam protection runs in your browser, with no tracking.</p>
          </form>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactSection {
  protected readonly title = copy.contactTitle;
  protected readonly lead = copy.contactLead;
  protected readonly c = site.contact;
  protected readonly state = signal<FormState>('idle');
  protected readonly status = signal('');
  protected readonly copied = signal('');

  private readonly http = inject(HttpClient);
  private started = 0;
  /** The solved spam-check payload, started when the visitor first focuses the form. */
  private proof: Promise<string> | null = null;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(EMAIL)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
    website: [''],
  });

  constructor() {
    afterNextRender(() => (this.started = Date.now()));
  }

  protected invalid(name: 'name' | 'email' | 'message'): boolean {
    const ctrl: AbstractControl = this.form.controls[name];
    return ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  protected copyEmail(): void {
    const email = this.c.email;
    if (!email) return;
    const done = (msg: string) => {
      this.copied.set(msg);
      setTimeout(() => this.copied.set(''), 2400);
    };
    navigator.clipboard?.writeText(email).then(
      () => done('Copied'),
      () => done('Press Ctrl+C to copy'),
    ) ?? done('Press Ctrl+C to copy');
  }

  protected startProof(): Promise<string> | null {
    const url = this.c.challengeEndpoint;
    if (url && !this.proof) {
      this.proof = solveChallenge(url);
      this.proof.catch(() => undefined); // reported on submit
    }
    return this.proof;
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.state.set('error');
      this.status.set('Check the highlighted fields.');
      document.querySelector<HTMLElement>('.contact-form [aria-invalid="true"]')?.focus();
      return;
    }
    const body = new FormData();
    const v = this.form.getRawValue();
    body.set('name', v.name);
    body.set('email', v.email);
    body.set('message', v.message);
    body.set('website', v.website);
    body.set('started', String(this.started));

    this.state.set('sending');
    this.status.set('');
    try {
      body.set('altcha', (await this.startProof()) ?? '');
    } catch (err) {
      this.proof = null;
      this.fail((err as Error).message);
      return;
    }
    // Every challenge works once: the next attempt gets a fresh one.
    this.proof = null;
    this.http
      .post<{ ok: boolean; error?: string }>(this.c.formEndpoint!, body, { headers: { Accept: 'application/json' } })
      .subscribe({
        next: (res) => {
          if (res.ok) {
            this.form.reset();
            this.started = Date.now();
            this.state.set('sent');
            this.status.set('Message sent. I’ll reply to the email address you gave.');
          } else {
            this.fail(res.error);
          }
        },
        error: (err: HttpErrorResponse) =>
          this.fail(err.status === 0 ? 'The message couldn’t be sent — check your connection and try again.' : err.error?.error),
      });
  }

  private fail(message?: string): void {
    this.state.set('error');
    this.status.set(message || 'The message couldn’t be sent. Try again, or email me directly.');
  }
}
