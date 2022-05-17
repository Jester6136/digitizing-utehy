import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import 'rxjs/add/operator/takeUntil';

@Injectable()
export class SharedService {
    private reloadSource = new BehaviorSubject(false);
    private reloadSourceScreenSaver = new BehaviorSubject(false);
    private reloadSourceWhenMoveBackQueue = new Subject<any>();
    private patientInfoSource = new BehaviorSubject(null);
    private radiologyServiceRequestSource = new BehaviorSubject(null);
    reload = this.reloadSource.asObservable();
    patientInfo = this.patientInfoSource.asObservable();
    changeArea = this.reloadSourceScreenSaver.asObservable();
    moveBackToQueueState = this.reloadSourceWhenMoveBackQueue.asObservable();
    radiologyServiceRequestId = this.radiologyServiceRequestSource.asObservable();
    constructor() {
    }

    reloadDataFromChild(reload: boolean) {
        this.reloadSource.next(reload);
    }

    reloadExamniationScreenSaver(reloadArea: boolean) {
        this.reloadSourceScreenSaver.next(reloadArea);
    }

    moveBackToQueue(state: any) {
        this.reloadSourceWhenMoveBackQueue.next(state);
    }

    patientInfoShared(patientInfo: any) {
        this.patientInfoSource.next(patientInfo);
    }

    radiologyServiceRequestSharedID(RadiologyServiceId: any) {
        this.radiologyServiceRequestSource.next(RadiologyServiceId);
    }
}
