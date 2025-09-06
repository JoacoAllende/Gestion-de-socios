import { Routes } from '@angular/router';
import { MembershipPaymentsComponent } from './components/membership-payments/membership-payments.component';
import { MembershipComponent } from './components/membership/membership.component';
import { DischargedMembershipsComponent } from './components/discharged-memberships/discharged-memberships.component';
import { MembershipsComponent } from './components/memberships/memberships.component';
import { FullStatisticsComponent } from './components/full-statistics/full-statistics.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
    { path: '', redirectTo: 'socios', pathMatch: 'full' },
    { path: 'estadisticas', component: FullStatisticsComponent },
    { path: 'login', component: LoginComponent },
    { path: 'pagos', component: MembershipPaymentsComponent },
    { path: 'socio', component: MembershipComponent },
    { path: 'socio/:id', component: MembershipComponent },
    { path: 'socios', component: MembershipsComponent },
    { path: 'socios-bajas', component: DischargedMembershipsComponent },
];
