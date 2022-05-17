import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import 'rxjs/add/operator/takeUntil';
import { ApiService, AuthenService, FunctionConstants, LoggedInGuard } from 'core';
import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './login.component';


const routing: Routes = [
    { path: '', component: LoginComponent }
];

@NgModule({
    imports: [
        CommonModule,
        InputTextModule,
        SharedModule,
        HttpModule,
        FormsModule,
        RouterModule.forChild(routing),
        ReactiveFormsModule
    ],
    declarations: [
        LoginComponent
    ],
    exports: [],
    providers: [
        ApiService,
        FunctionConstants,
        LoggedInGuard,
        AuthenService
    ]
})

export class LoginModule { }
