import { AfterViewInit, ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { Page, PageGroup, SystemConstants, Utils } from 'core';
import { takeUntil } from 'rxjs/operators';
declare let $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent extends Utils implements OnInit, AfterViewInit {

  public ok = false;
  public pages: any[];
  public pageGroups: PageGroup[];
  public active = false;
  public index = 0;
  public recently: Page[];
  public filterMenuKey: string;
  public pageIndexes: number[];

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    this.pageGroups = this._functionConstants.GetPageGroupAndPageFromPermissions();
    debugger;
    this.pages = [];
    this.pageGroups.forEach(ds => {
      ds.active = false;
      ds.is_open = false;
      ds.pages.forEach(x => {
        this.pages.push($.extend(true, {}, x));
      });
    });
    this.recently = this._functionConstants.GetRecentlyPages();
    this._storageService.changes.pipe(takeUntil(this.unsubscribe)).subscribe((data: any) => {
      if (data.key == SystemConstants.get('PREFIX_CAPTION_LANGUAGE')) {
        this.currentLang = data.value;
      } else if (data.key == SystemConstants.get('PREFIX_RECENTLY_PAGES')) {
        this.recently = this._functionConstants.GetRecentlyPages();
      }
    });
    this.updateSelectingMenu(window.location.pathname.slice(1));
  }

  redirect(page) {
    if (page == '') {
      this.updateSelectingMenu('');
      this._router.navigate(['']);
    } else {
      this._functionConstants.UpdateRecentlyPages(page);
      setTimeout(() => {
        $('html,body').animate({ scrollTop: 0 }, 200);
      });
      this.updateSelectingMenu(page.url);
      this._router.navigate([page.url]);
    }
  }

  isDashboard() {
    return window.location.pathname.slice(1) == '';
  }
  public Ok(pageGroup,i) {
    pageGroup.is_open = !pageGroup.is_open;
    setTimeout(() => {
      if(pageGroup.is_open) { 
        $('#id'+i).addClass('open');
      } else { 
        $('#id'+i).removeClass('open');
      } 
      $('.submenu').removeAttr('style');
    });
  }

  updateSelectingMenu(url) {
    (this.pageGroups || []).forEach(pg => {
      pg.active = false;
      pg.pages.forEach(p => {
        p.active = false;
        if (p.url == url) {
          p.active = true;
          pg.active = true;
        }
      });
    });
  }

  ngAfterViewInit() {
    $('#sidebar-collapse').click(function () {
      setTimeout(() => {
        let event;
        if (typeof (Event) === 'function') {
          event = new Event('resize');
        } else {
          event = document.createEvent('Event');
          event.initEvent('resize', true, true);
        }
        window.dispatchEvent(event);
      }, 100);
      if (!$('#sidebar').hasClass('menu-min')) {
        $('.main-content').css('padding-left', '43px');
        $('#breadcrumbs').css('left', '43px');
        $('.footer-inner').css('left', '43px');
      } else {
        $('.main-content').css('padding-left', '190px');
        $('#breadcrumbs').css('left', '190px');
        $('.footer-inner').css('left', '190px');
      }
    });
    setTimeout(() => {
      let event;
      if (typeof (Event) === 'function') {
        event = new Event('resize');
      } else {
        event = document.createEvent('Event');
        event.initEvent('resize', true, true);
      }
      window.dispatchEvent(event);
    }, 100);
    setTimeout(() => {
      $('.main-content').css('padding-left', $('#sidebar').width() + 1);
      $('#breadcrumbs').css('left', $('#sidebar').width() + 1);
      $('.footer-inner').css('left', $('#sidebar').width() + 1);
    }, 1000);
  }

  onFilterMenu() {
    let sifter = new Sifter(this.pages);
    let fields = this._storageService.getItem(SystemConstants.get('PREFIX_CAPTION_LANGUAGE')) == SystemConstants.get('LOCAL') ? ['page_name_l'] : ['page_name_e'];
    let results = sifter.search(this.filterMenuKey, {
      fields: fields
    });
    this.pageIndexes = [];
    this.pages.forEach(ds => {
      ds.page_name_e_f = ds.page_name_e;
      ds.page_name_l_f = ds.page_name_l;
    });
    if (results.query.length && results.tokens.length) {
      results.items.forEach(ds => {
        if (this.pages[ds.id].public_flag) {
          for (let i = 0, n = results.tokens.length; i < n; i++) {
            let pos = this.pages[ds.id][fields[0]].search(results.tokens[i].regex);
            if (pos >= 0 && this.pages[ds.id][fields[0]].length > 0) {
              let match = this.pages[ds.id][fields[0]].match(results.tokens[i].regex);
              this.pages[ds.id][fields[0] + '_f'] = this.pages[ds.id][fields[0]].replace(match[0], '<span class="highlight">' + match[0] + '</span>');
            }
          }
          this.pageIndexes.push(ds.id);
        }
      });
    }
  }
}
