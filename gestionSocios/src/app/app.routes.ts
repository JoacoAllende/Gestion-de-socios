import { Routes } from '@angular/router';
import { MembershipPaymentsComponent } from './components/membership-payments/membership-payments.component';
import { MembershipComponent } from './components/membership/membership.component';

export const routes: Routes = [
    { path: 'socios', component: MembershipPaymentsComponent },
    { path: 'socio', component: MembershipComponent },
    { path: 'socio/:id', component: MembershipComponent }
];
