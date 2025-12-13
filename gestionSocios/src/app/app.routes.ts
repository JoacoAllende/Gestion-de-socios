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
import { EmployeeComponent } from './components/employee/employee.component';
import { MembershipStateComponent } from './components/membership-state/membership-state.component';
import { SummaryComponent } from './components/summary/summary.component';
import { EventsComponent } from './components/events/events.component';
import { EventComponent } from './components/event/event.component';
import { EventMovementsComponent } from './components/event-movements/event-movements.component';
import { EventMovementComponent } from './components/event-movement/event-movement.component';
import { MovementDetailsComponent } from './components/movement-details/movement-details.component';
import { MovementDetailComponent } from './components/movement-detail/movement-detail.component';
import { ConfigurationComponent } from './components/configuration/configuration/configuration.component';
import { ActivityValuesComponent } from './components/configuration/activity-values/activity-values.component';
import { DiscountsComponent } from './components/configuration/discounts/discounts.component';
import { BaseMemberValueComponent } from './components/configuration/base-member-value/base-member-value.component';
import { InitializeYearComponent } from './components/configuration/initialize-year/initialize-year.component';
import { RecalculatePaymentsComponent } from './components/configuration/recalculate-payments/recalculate-payments.component';
import { InitializeYearEmployeesComponent } from './components/configuration/initialize-year-employees/initialize-year-employees.component';

const currentYear = new Date().getFullYear();

export const routes: Routes = [
    { path: '', redirectTo: `pagos/${currentYear}`, pathMatch: 'full' },
    { path: 'caja/:anio', component: DailyBoxComponent, canActivate: [AuthGuard] },
    { path: 'configuraciones', component: ConfigurationComponent, canActivate: [AuthGuard] },
    { path: 'configuraciones/descuentos', component: DiscountsComponent, canActivate: [AuthGuard] },
    { path: 'configuraciones/inicializar-anio', component: InitializeYearComponent, canActivate: [AuthGuard] },
    { path: 'configuraciones/inicializar-anio-empleados', component: InitializeYearEmployeesComponent, canActivate: [AuthGuard] },
    { path: 'configuraciones/recalcular-pagos', component: RecalculatePaymentsComponent, canActivate: [AuthGuard] },
    { path: 'configuraciones/valores-actividad', component: ActivityValuesComponent, canActivate: [AuthGuard] },
    { path: 'configuraciones/valor-socio-base', component: BaseMemberValueComponent, canActivate: [AuthGuard] },
    { path: 'empleado/:anio', component: EmployeeComponent, canActivate: [AuthGuard] },
    { path: 'empleado/:anio/:id', component: EmployeeComponent, canActivate: [AuthGuard] },
    { path: 'empleado-alta/:anio/:id', component: EmployeeComponent, canActivate: [AuthGuard] },
    { path: 'estadisticas/:anio', component: FullStatisticsComponent, canActivate: [AuthGuard] },
    { path: 'evento', component: EventComponent, canActivate: [AuthGuard] },
    { path: 'evento/:id', component: EventComponent, canActivate: [AuthGuard] },
    { path: 'evento/:id/movimiento', component: EventMovementComponent, canActivate: [AuthGuard] },
    { path: 'evento/:id/movimiento/:movementId', component: EventMovementComponent, canActivate: [AuthGuard] },
    { path: 'evento/:id/movimientos', component: EventMovementsComponent, canActivate: [AuthGuard] },
    { path: 'eventos', component: EventsComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'movimiento-caja', component: DailyBoxMovementComponent, canActivate: [AuthGuard] },
    { path: 'movimiento-caja/:id', component: DailyBoxMovementComponent, canActivate: [AuthGuard] },
    { path: 'movimiento/:movementId/detalle', component: MovementDetailComponent, canActivate: [AuthGuard] },
    { path: 'movimiento/:movementId/detalle/:detailId', component: MovementDetailComponent, canActivate: [AuthGuard] },
    { path: 'movimiento/:movementId/detalles', component: MovementDetailsComponent, canActivate: [AuthGuard] },
    { path: 'pagos/:anio', component: MembershipPaymentsComponent, canActivate: [AuthGuard] },
    { path: 'resumenes', component: SummaryComponent, canActivate: [AuthGuard] },
    { path: 'resumenes/:mes/:anio', component: SummaryComponent, canActivate: [AuthGuard] },
    { path: 'socio-estado', component: MembershipStateComponent},
    { path: 'socio-estado/:dni', component: MembershipStateComponent},
    { path: 'socio/:anio', component: MembershipComponent, canActivate: [AuthGuard] },
    { path: 'socio/:anio/:id', component: MembershipComponent, canActivate: [AuthGuard] },
    { path: 'socio-alta/:anio/:id', component: MembershipComponent, canActivate: [AuthGuard] },
    { path: 'socios', component: MembershipsComponent, canActivate: [AuthGuard] },
    { path: 'socios-bajas', component: DischargedMembershipsComponent, canActivate: [AuthGuard] },
    { path: 'sueldos/:anio', component: EmployeesComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: `pagos/${currentYear}` }
];
