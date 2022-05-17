
import { AfterViewInit, Component, Injector, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ENotificationType, Facility, MatchOtherValidator, SystemConstants, User, Utils } from 'core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Md5 } from 'ts-md5';
declare var $: any;
declare var bootstro: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent extends Utils implements OnInit, AfterViewInit {

  public full_name = '';
  public user_name = '';
  public moment = moment;
  public message_unread = 0;
  public userGroupMessages: any[] = [];
  public users: User[] = [];
  public showChatBox = false;
  public userOnline = [];

  private facilities: Facility[];
  private current_facilities: any;
  public showChangePasswordModal = false;
  public items: MenuItem[];
  public lang = localStorage.getItem('data_lang');
  public isFullScreen = localStorage.getItem('full');

  public displayHelp = false;
  public keys: any[] = [];

  public settingForm: FormGroup;
  public settingFormSubscription: Subscription;
  public displaySetting = false;
  public currentSetting: any;

  public font_sizes: any[] = SystemConstants.get('SETTING_FONT_SIZE');
  public typing_speeds: any[] = SystemConstants.get('SETTING_TYPING_SPEED');
  public font_families: any[] = SystemConstants.get('SETTING_FONT_FAMILY');
  public selectedFontSize: any;
  public selectedTypingSpeed: any;
  public selectedFontFamily: any;
  public opd_icd_number: number;
  public use_print_default: boolean;
  public print_preview: boolean;

  public userSearchString: any;
  public selectedMessageGroup: any;

  public deleteInboxFlag = false;

  @ViewChild(NgForm, { static: true }) changePasswordForm: FormGroup;

  constructor(injector: Injector) {
    super(injector);
    this.full_name = this._authenService.getLoggedInUser().objectjson_person.full_name;
    this.settingForm = new FormGroup({
      'font_size': new FormControl(null, Validators.required),
      'typing_speed': new FormControl(null, Validators.required),
      'font_family': new FormControl(null, Validators.required),
      'opd_icd_number': new FormControl(null, [Validators.required, Validators.min(1), Validators.max(10)]),
      'use_print_default': new FormControl(true),
      'print_preview': new FormControl(true)
    });
  }

  ngOnInit() {

    this.facilities = JSON.parse(localStorage.getItem(SystemConstants.get('PREFIX_FACILITIES')));

    this.current_facilities = JSON.parse(localStorage.getItem(SystemConstants.get('PREFIX_CURRENT_FACILITY')));

    this._translateService.get(['COMMON.label', 'LANG.local', 'LANG.en', 'COMMON.data']).subscribe((res) => {
      this.items = [{
        label: res['COMMON.label'],
        items: [
          { label: res['LANG.local'], icon: 'img-thumbnail img-flag img-flag-local', styleClass: this.currentLang == SystemConstants.get('LOCAL') ? 'selected' : '', command: () => this.SelectedLang('local') },
          { label: res['LANG.en'], icon: 'img-thumbnail img-flag img-flag-gb', styleClass: this.currentLang != SystemConstants.get('LOCAL') ? 'selected' : '', command: () => this.SelectedLang('en') }
        ]
      },
      {
        label: res['COMMON.data'],
        items: [
          { label: res['LANG.local'], icon: 'img-thumbnail img-flag img-flag-local', styleClass: this.local_flag ? 'selected' : '', command: () => this.changeLanguageData('local') },
          { label: res['LANG.en'], icon: 'img-thumbnail img-flag img-flag-gb', styleClass: !this.local_flag ? 'selected' : '', command: () => this.changeLanguageData('en') }
        ]
      }];
    });
    this._storageService.changes.pipe(takeUntil(this.unsubscribe)).subscribe((data: any) => {
      if (data.key == SystemConstants.get('PREFIX_CAPTION_LANGUAGE') || data.key == SystemConstants.get('PREFIX_DATA_LANGUAGE')) {
        this._translateService.get(['COMMON.label', 'LANG.local', 'LANG.en', 'COMMON.data']).subscribe((res) => {
          this.items = [{
            label: res['COMMON.label'],
            items: [
              { label: res['LANG.local'], icon: 'img-thumbnail img-flag img-flag-local', styleClass: this.currentLang == SystemConstants.get('LOCAL') ? 'selected' : '', command: () => this.SelectedLang('local') },
              { label: res['LANG.en'], icon: 'img-thumbnail img-flag img-flag-gb', styleClass: this.currentLang != SystemConstants.get('LOCAL') ? 'selected' : '', command: () => this.SelectedLang('en') }
            ]
          },
          {
            label: res['COMMON.data'],
            items: [
              { label: res['LANG.local'], icon: 'img-thumbnail img-flag img-flag-local', styleClass: this.local_flag ? 'selected' : '', command: () => this.changeLanguageData('local') },
              { label: res['LANG.en'], icon: 'img-thumbnail img-flag img-flag-gb', styleClass: !this.local_flag ? 'selected' : '', command: () => this.changeLanguageData('en') }
            ]
          }];
        });
      }
    });
  }

  ngAfterViewInit() {
    if (this.isFullScreen === 'i') {
      this.goInFullScreen();
    }
  }

  SelectedLang(lang) {
    this._translateService.use(lang);
    this._storageService.setItem(SystemConstants.get('PREFIX_CAPTION_LANGUAGE'), lang);
    this.currentLang = lang;
  }

  changeLanguageData(lang) {
    if (this._functionConstants.GetCurrentDataLanguage() != lang) {
      this._apiService.get('/api/user/change-language?lang=' + (lang == 'en' ? 'e' : 'l')).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
        this._storageService.setItem(SystemConstants.get('PREFIX_DATA_LANGUAGE'), lang);
      });
    }
  }

  openchangePasswordModal() {
    this.changePasswordForm = new FormGroup({
      'password': new FormControl('', Validators.required),
      'new_password': new FormControl('', Validators.required),
      'confirm_password': new FormControl('', [Validators.required, MatchOtherValidator('new_password')])
    });
    this.showChangePasswordModal = true;
    setTimeout(() => {
      $('#changePasswordForm').closest('.modal').modal('toggle');
    }, 300);
  }

  onChangePasswordSubmit() {
    if (this.changePasswordForm.valid) {
      let password = this.changePasswordForm.value['password'];
      let new_password = this.changePasswordForm.value['new_password'];
      let user = new User();
      let item = $.extend(true, {}, user);
      item.password = Md5.hashStr(password).toString();
      item.new_password = Md5.hashStr(new_password).toString();
      this._apiService.post('/api/user/change-password', item).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
        this.showChangePasswordModal = false;
        this._functionConstants.ShowNotification(ENotificationType.GREEN, 'MESSAGE.update_successfully');
        $('#changePasswordForm').closest('.modal').modal('toggle');
      });
    }
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
    $('#changePasswordForm').closest('.modal').modal('toggle');
  }

  openHelpModal() {
    this.keys = [];
    let self = this;
    $('[data-sk]').each(function () {
      let $this = $(this);
      let key = $this.data('sk');
      if (!$this.data('skh') || $this.data('skh') == 'true') {
        self.keys.push({
          key: key.split('.')[1],
          message: $this.attr('title') || $this.text().trim()
        });
      }
    });
    if (this.keys.length > 0) {
      this.displayHelp = true;
    }
  }

  startFeaturesTour() {
    this.displayHelp = false;
    this._translateService.get(['GUIDE.next', 'GUIDE.previous']).subscribe(messages => {
      bootstro.start('.bootstro', {
        nextButtonText: messages['GUIDE.next'] + ' »',
        prevButtonText: messages['GUIDE.previous'] + ' «',
        finishButton: '',
        stopOnBackdropClick: false,
        onComplete: function (params) {
          console.log('Reached end of introduction with total ' + (params.idx + 1) + ' slides');
        },
        onExit: function (params) {
          console.log('Introduction stopped at slide #' + (params.idx + 1));
        }
      });
    });
  }

  openSettingPopup() {
    let storage = this._storageService.getItem(SystemConstants.get('SETTING_PREFIX'));
    this.currentSetting = (storage && storage != '') ? JSON.parse(storage) : {
      font_size: 'ls-fs-13',
      typing_speed: '500',
      font_family: 'ls-ff-sf',
      opd_icd_number: 5,
      use_print_default: true,
      print_preview: true
    };
    if (this.currentSetting.use_print_default == null) {
      this.currentSetting.use_print_default = true;
    }
    if (this.currentSetting.print_preview == null) {
      this.currentSetting.print_preview = true;
    }
    this.settingFormSubscription = this.settingForm.valueChanges.subscribe(value => {
      this.applySetting(value);
    });
    this.selectedFontSize = this.currentSetting.font_size;
    this.selectedTypingSpeed = this.currentSetting.typing_speed;
    this.selectedFontFamily = this.currentSetting.font_family;
    this.opd_icd_number = this.currentSetting.opd_icd_number;
    this.use_print_default = this.currentSetting.use_print_default;
    this.print_preview = this.currentSetting.print_preview;
    this.displaySetting = true;
  }

  applySetting(settings) {
    $('body').removeClass(function (index, className) {
      return (className.match(/(^|\s)ls-\S+/g) || []).join(' ');
    });
    Object.keys(settings).forEach(key => {
      $('body').addClass(settings[key]);
    });
  }

  saveSetting() {
    let newSetting = {
      font_size: this.selectedFontSize,
      typing_speed: this.selectedTypingSpeed,
      font_family: this.selectedFontFamily,
      opd_icd_number: this.opd_icd_number,
      use_print_default: this.use_print_default,
      print_preview: this.print_preview
    };
    if (!this.use_print_default) {
      this._functionConstants.pingPrint().subscribe(res => {
        this.onValidSetting(newSetting);
      }, error => {
        this._functionConstants.ShowNotification(ENotificationType.ORANGE, 'SETTING.invalid_custom_print');
      });
    } else {
      this.onValidSetting(newSetting);
    }
  }

  onValidSetting(newSetting: any) {
    this._storageService.setItem(SystemConstants.get('SETTING_PREFIX'), JSON.stringify(newSetting));
    this.currentSetting = null;
    this.displaySetting = false;
    this.settingFormSubscription = null;
  }

  cancelSetting() {
    $('body').removeClass(function (index, className) {
      return (className.match(/(^|\s)ls-\S+/g) || []).join(' ');
    });
    if (this.currentSetting) {
      Object.keys(this.currentSetting).forEach(key => {
        if ((this.currentSetting[key] || '').toString().startsWith('ls')) {
          $('body').addClass(this.currentSetting[key]);
        }
      });
    }
    this.displaySetting = false;
    this.settingFormSubscription = null;
  }


  // message
  onSearchListUserOnline() {
    this._apiService.post('/api/user/search-user-online', {
      full_name: this.userSearchString,
      online_flag: true
    }, true).pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        if (res.Data) {
          this.users = res.Data.filter(t => t['id'] !== this.currentUser['id']);
        }
        this.detectChange();
      });
  }

  onFilterUser(event: any) {
    if (event) {
      let container = $('#users .list-group');
      this.users.forEach(t => {
        if (t['full_name'] != null && this._functionConstants.slugify(t['full_name']).includes(this._functionConstants.slugify(event))) {
          let ele = container.find('#' + t['user_name']).closest('li');
          ele.show();
        } else {
          let ele = container.find('#' + t['user_name']).closest('li');
          ele.hide();
        }
      });
    } else {
      let container = $('#users .list-group');
      this.users.forEach(t => {
        let ele = container.find('#' + t['user_name']).closest('li');
        ele.show();
      });
    }
  }

  onSearchMessageInbox() {
    this._apiService.get('/api/messenger/search-inbox')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        if (res.Data) {
          this.userGroupMessages = res.Data;
        }
      });
  }

  onMarkAsReadMessage(message_group_id: any, mark_as_read_flag: boolean = true) {
    if (message_group_id) {
      this._apiService.post('/api/messenger/mask-as-read', { message_group_id: message_group_id, mark_as_read_flag: mark_as_read_flag })
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {
          if (!res.Data) {
            this._functionConstants.ShowNotification(ENotificationType.RED, res.messageCode);
          } else {
            if (mark_as_read_flag) {
              $('#inbox_group_' + message_group_id).removeClass('unread');
            } else {
              $('#inbox_group_' + message_group_id).addClass('unread');
            }
            this.userGroupMessages.forEach(t => {
              if (t['message_group_id'] == message_group_id) {
                t['read_flag'] = mark_as_read_flag;
                return;
              }
            });
            this.onCountMessageUnRead();
          }
        });
    }
  }

  onCountMessageUnRead() {
    this._apiService.get('/api/messenger/count-unread')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        this.message_unread = res.Data;
        if (this.message_unread == 0) {
          $('#iconMessage').removeClass('icon-animated-vertical');
          let arrTitle = $('title').text().split(')');
          if (arrTitle && arrTitle.length > 1) {
            $('title').text(arrTitle[1]);
          }
        } else {
          $('#iconMessage').addClass('icon-animated-vertical');
          $('title').text(`(${this.message_unread}) ${$('title').text()}`);
        }
      });
  }

  onDeleteInbox() {
    if (this.selectedMessageGroup) {
      this._apiService.post('/api/messenger/delete-inbox', { message_group_id: this.selectedMessageGroup['message_group_id'] })
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {
          if (res.Data) {
            let indx = this.userGroupMessages.findIndex(t => t['message_group_id'] == this.selectedMessageGroup['message_group_id']);
            if (indx > -1) {
              if (!this.selectedMessageGroup['read_flag']) {
                if (this.message_unread > 0) {
                  this.message_unread -= 1;
                }
              }
              this.userGroupMessages.splice(indx, 1);
              this.selectedMessageGroup = null;
              this.deleteInboxFlag = false;
            }
            this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
          } else {
            this._functionConstants.ShowNotification(ENotificationType.RED, res.messageCode);
          }
        });
    }
  }

  onConfirmDeleteInbox(group: any) {
    this.deleteInboxFlag = true;
    this.selectedMessageGroup = group;
  }
}
