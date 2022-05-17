import { APP_BASE_HREF, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ApplicationRef, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { SharedModule } from '../shared/shared.module';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainComponent } from './main.component';
import { mainRoutes } from './main.route';
import { SecurityModule } from './security/security.module';

@NgModule({
    declarations: [
        SidebarComponent,
        FooterComponent,
        NavbarComponent,
        MainComponent,
        DashboardComponent
    ],
    imports: [
        SecurityModule,
        SharedModule,
        RouterModule.forChild(mainRoutes)
    ],
    exports: [],
    providers: [
        ApplicationRef,
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: APP_BASE_HREF, useValue: '/' },
    ]
})

export class MainModule { }
