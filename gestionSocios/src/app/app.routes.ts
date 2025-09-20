import { Routes } from '@angular/router';
import { MembershipPaymentsComponent } from './components/membership-payments/membership-payments.component';
import { MembershipComponent } from './components/membership/membership.component';
import { DischargedMembershipsComponent } from './components/discharged-memberships/discharged-memberships.component';
import { MembershipsComponent } from './components/memberships/memberships.component';
import { FullStatisticsComponent } from './components/full-statistics/full-statistics.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './services/auth-guard.service';
import { DailyBoxComponent } from './components/daily-box/daily-box.component';
import { DailyBoxMovementComponent } from './components/daily-box-movement/daily-box-movement.component';
import { EmployeesComponent } from './components/employees/employees.component';

export const routes: Routes = [
    { path: '', redirectTo: 'pagos', pathMatch: 'full' },
    { path: 'caja', component: DailyBoxComponent, canActivate: [AuthGuard] },
    { path: 'estadisticas', component: FullStatisticsComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'movimiento-caja', component: DailyBoxMovementComponent, canActivate: [AuthGuard] },
    { path: 'movimiento-caja/:id', component: DailyBoxMovementComponent, canActivate: [AuthGuard] },
    { path: 'pagos', component: MembershipPaymentsComponent, canActivate: [AuthGuard] },
    { path: 'socio', component: MembershipComponent, canActivate: [AuthGuard] },
    { path: 'socio/:id', component: MembershipComponent, canActivate: [AuthGuard] },
    { path: 'socio-alta/:id', component: MembershipComponent, canActivate: [AuthGuard] },
    { path: 'socios', component: MembershipsComponent, canActivate: [AuthGuard] },
    { path: 'socios-bajas', component: DischargedMembershipsComponent, canActivate: [AuthGuard] },
    { path: 'sueldos', component: EmployeesComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: 'pagos' }
];
