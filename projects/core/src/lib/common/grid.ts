
import { Injector, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as FileSaver from 'file-saver';
import { DomHandler, MenuItem, TreeNode } from 'primeng/api';
import { ObjectUtils } from 'primeng/components/utils/objectutils';
import { Table } from 'primeng/table';
import { combineLatest as observableCombineLatest } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { SystemConstants } from './system.constants';
import { Utils } from './utils';
declare let $: any;

export class Grid extends Utils implements OnDestroy {

    @ViewChild('dataTable', {static: false}) dataTable: Table;

    public searchFormGroup: FormGroup;
    public totalRecords = 0;
    public first = 0;
    public totalPages = 1;
    protected rowHeight = 28;
    protected loading = false;
    public page = 1;
    public pageSize = 10;
    protected fromRecords = 0;
    public toRecords = 0;
    public pageLabel = '';
    public data: any[] = [];
    public data_table_tree: any;
    public treeData: TreeNode[];
    public originSource = [];
    public globalFilterText = '';
    public LZCompress = true;
    public selectecAllAfterKeydown: boolean;
    protected tableName = 'faclity';
    public dataKey = 'id';
    protected dataLabel = '';
    protected notByLanguageLabels = [];
    protected filterFields = [];
    protected apiUrl = '';
    protected searchApiUrl = '';
    protected getListByIdApiUrl = '/api/xxx/get-list-by-id';
    protected exportUrl = '';
    protected exportFilename = '';
    protected searchValue: any = {
        page: this.page,
        pageSize: this.pageSize
    };
    protected expandable = false;
    public tableActions: MenuItem[];
    public selectedDataTableItems: any[] = [];
    protected styleMap: { [key: string]: string };
    protected makeRowSameHeightAfterLoad = false; // Use for frozen datatable
    protected isTreeTable = false;
    protected isTree = false;
    public treeFilterText: string;
    protected loadBalancing = false;
    protected APIModuleName: string;
    public gridContextMenuItems: MenuItem[];
    public selectedNode: any;
    protected treeLoadedAll = false;
    protected callbackWhenSelectNode = false;
    protected notDualLanguage = false;
    protected loadTreeFromLocalFile = false;
    protected rootIcon = 'fa-hospital-alt';
    protected loadTreeWithFacility = false;
    protected hasBonusParams = false;
    protected bonusParams = [];
    public predicateAfterSearch: any;
    public predicateBeforeSearch: any;
    protected breakSearch = false;
    protected editingCellKeydownEvent: any;
    public origin_parent: any;
    public leave_message: string;
    public allowSelectableDataKeys = [];
    public searching = false;
    public allow_search_when_searching;

    public fnMoveGrid: any;
    public keepSelectedOnChangePage = false;
    public selectedRow: any;
    public cols: any[] = [];
    public selectedColumns: any[] = [];

    constructor(injector: Injector) {
        super(injector);
        this._storageService.changes.pipe(takeUntil(this.unsubscribe)).subscribe((c: any) => {
            if (c.key == SystemConstants.get('PREFIX_CAPTION_LANGUAGE')) {
                this._translateService.get(['COMMON.page_label', 'COMMON.comfirm_before_deactive_route']).subscribe((message: string) => {
                    this.pageLabel = message['COMMON.page_label'].replace('{fromRecords}', (this.fromRecords || 0).toString())
                        .replace('{toRecords}', (this.toRecords + 0).toString())
                        .replace('{totalRecords}', (this.totalRecords + 0).toString());
                    this.leave_message = message['COMMON.comfirm_before_deactive_route'];
                });
            }
        });

        this.editingCellKeydownEvent = (e) => {
            let blur = $.Event('blur');
            let tmp, nextCell, rowIndex, columnIndex, firstPos, lastPos;
            switch (e.keyCode) {
                // left
                case 37: if (this.dataTable) {
                    tmp = $(this.dataTable.editingCell);
                    nextCell = $(e.target).closest('td').prev();
                    if (tmp.find('input').length > 0) {
                        firstPos = tmp.find('input')[0].selectionStart == 0;
                        if (firstPos && nextCell.hasClass('ui-editable-column') && !nextCell.find('p-celleditor').children('ng-selectize').length) {
                            $(e.target).trigger(blur);
                            setTimeout(() => {
                                if (nextCell.length) {
                                    nextCell.addClass('ui-editing-cell');
                                    setTimeout(() => {
                                        this.dataTable.editingCell = nextCell[0];
                                        this._changeDetectorRef.detectChanges();
                                        nextCell.find('input').focus();
                                        if (this.selectecAllAfterKeydown) {
                                            nextCell.find('input').select();
                                        }
                                    });
                                }
                            });
                            e.preventDefault();
                        }
                    }
                }
                    break;
                // up
                case 38:
                    if (this.dataTable) {
                        tmp = $(this.dataTable.editingCell);
                        rowIndex = tmp.closest('tr').index();
                        if (rowIndex > 0) {
                            columnIndex = tmp.index();
                            for (let i = rowIndex - 1; i >= 0; i--) {
                                let tmp_next = tmp.closest('tbody').find('tr').eq(i).find('td').eq(columnIndex);
                                if (tmp_next.hasClass('ui-editable-column') && !tmp_next.hasClass('skip')) {
                                    nextCell = tmp_next;
                                    break;
                                }
                            }
                            if (nextCell.length && !nextCell.find('p-celleditor').children('ng-selectize').length) {
                                $(e.target).trigger(blur);
                                setTimeout(() => {
                                    if (nextCell.length) {
                                        nextCell.addClass('ui-editing-cell');
                                        setTimeout(() => {
                                            this.dataTable.editingCell = nextCell[0];
                                            this._changeDetectorRef.detectChanges();
                                            nextCell.find('input').focus();
                                            if (this.selectecAllAfterKeydown) {
                                                nextCell.find('input').select();
                                            }
                                        });
                                    }
                                });
                                e.preventDefault();
                            }
                        }
                    }

                    break;
                // right
                case 39: if (this.dataTable) {
                    tmp = $(this.dataTable.editingCell);
                    nextCell = $(e.target).closest('td').next();
                    if (tmp.find('input').length > 0) {
                        lastPos = tmp.find('input')[0].selectionStart == tmp.find('input').val().length;
                        if (lastPos && nextCell.hasClass('ui-editable-column') && !nextCell.find('p-celleditor').children('ng-selectize').length) {
                            $(e.target).trigger(blur);
                            setTimeout(() => {
                                if (nextCell.length) {
                                    nextCell.addClass('ui-editing-cell');
                                    setTimeout(() => {
                                        this.dataTable.editingCell = nextCell[0];
                                        this._changeDetectorRef.detectChanges();
                                        nextCell.find('input').focus();
                                        if (this.selectecAllAfterKeydown) {
                                            nextCell.find('input').select();
                                        }
                                    });
                                }
                            });
                            e.preventDefault();
                        }
                    }
                }
                    break;
                // down
                case 40: if (this.dataTable) {
                    tmp = $(this.dataTable.editingCell);
                    rowIndex = tmp.closest('tr').index();
                    if (rowIndex >= 0) {
                        if (rowIndex < tmp.closest('tbody').children().length) {
                            columnIndex = tmp.index();
                            for (let i = rowIndex + 1; i < tmp.closest('tbody').children().length; i++) {
                                let tmp_next = tmp.closest('tbody').find('tr').eq(i).find('td').eq(columnIndex);
                                if (tmp_next.hasClass('ui-editable-column') && !tmp_next.hasClass('skip')) {
                                    nextCell = tmp_next;
                                    break;
                                }
                            }
                            if (nextCell.length && !nextCell.find('p-celleditor').children('ng-selectize').length) {
                                $(e.target).trigger(blur);
                                setTimeout(() => {
                                    if (nextCell.length) {
                                        nextCell.addClass('ui-editing-cell');
                                        setTimeout(() => {
                                            this.dataTable.editingCell = nextCell[0];
                                            this._changeDetectorRef.detectChanges();
                                            nextCell.find('input').focus();
                                            if (this.selectecAllAfterKeydown) {
                                                nextCell.find('input').select();
                                            }
                                        });
                                    }
                                });
                                e.preventDefault();
                            }
                        }
                    }
                }
                    break;
            }
        };

        Table.prototype.handleRowClick = function (event) {
            let target = event.originalEvent.target;
            let targetNode = target.nodeName;
            let parentNode = $(target).closest('tr'); // target.parentElement.nodeName;
            if (targetNode == 'INPUT' || targetNode == 'BUTTON' || targetNode == 'A' ||
                parentNode == 'INPUT' || parentNode == 'BUTTON' || parentNode == 'A' ||
                (DomHandler.hasClass(event.originalEvent.target, 'ui-clickable'))) {
                return;
            }
            if (this.selectionMode) {
                this.preventSelectionSetterPropagation = true;
                if (this.isMultipleSelectionMode() && event.originalEvent.shiftKey && this.anchorRowIndex != null) {
                    DomHandler.clearSelection();
                    if (this.rangeRowIndex != null) {
                        this.clearSelectionRange(event.originalEvent);
                    }
                    this.rangeRowIndex = event.rowIndex;
                    this.selectRange(event.originalEvent, event.rowIndex);
                } else {
                    let rowData = event.rowData;
                    let selected = this.isSelected(rowData);
                    let metaSelection = this.rowTouched ? false : this.metaKeySelection;
                    let dataKeyValue = this.dataKey ? String(ObjectUtils.resolveFieldData(rowData, this.dataKey)) : null;
                    this.anchorRowIndex = event.rowIndex;
                    this.rangeRowIndex = event.rowIndex;
                    if (metaSelection) {
                        let metaKey = event.originalEvent.metaKey || event.originalEvent.ctrlKey;
                        if (selected && metaKey) {
                            if (this.isSingleSelectionMode()) {
                                this._selection = null;
                                this.selectionKeys = {};
                                this.selectionChange.emit(null);
                            } else {
                                let selectionIndex_1 = this.findIndexInSelection(rowData);
                                this._selection = this.selection.filter(function (val, i) { return i != selectionIndex_1; });
                                this.selectionChange.emit(this.selection);
                                if (dataKeyValue) {
                                    delete this.selectionKeys[dataKeyValue];
                                }
                            }
                            this.onRowUnselect.emit({ originalEvent: event.originalEvent, data: rowData, type: 'row' });
                        } else {
                            if (this.isSingleSelectionMode()) {
                                this._selection = rowData;
                                this.selectionChange.emit(rowData);
                                if (dataKeyValue) {
                                    this.selectionKeys = {};
                                    this.selectionKeys[dataKeyValue] = 1;
                                }
                            } else if (this.isMultipleSelectionMode()) {
                                if (metaKey) {
                                    this._selection = this.selection || [];
                                } else {
                                    this._selection = [];
                                    this.selectionKeys = {};
                                }
                                this._selection = this.selection.concat([rowData]);
                                this.selectionChange.emit(this.selection);
                                if (dataKeyValue) {
                                    this.selectionKeys[dataKeyValue] = 1;
                                }
                            }
                            this.onRowSelect.emit({ originalEvent: event.originalEvent, data: rowData, type: 'row', index: event.rowIndex });
                        }
                    } else {
                        if (this.selectionMode === 'single') {
                            if (selected) {
                                this._selection = null;
                                this.selectionKeys = {};
                                this.selectionChange.emit(this.selection);
                                this.onRowUnselect.emit({ originalEvent: event.originalEvent, data: rowData, type: 'row' });
                            } else {
                                this._selection = rowData;
                                this.selectionChange.emit(this.selection);
                                this.onRowSelect.emit({ originalEvent: event.originalEvent, data: rowData, type: 'row', index: event.rowIndex });
                                if (dataKeyValue) {
                                    this.selectionKeys = {};
                                    this.selectionKeys[dataKeyValue] = 1;
                                }
                            }
                        } else if (this.selectionMode === 'multiple') {
                            if (selected) {
                                let selectionIndex_2 = this.findIndexInSelection(rowData);
                                this._selection = this.selection.filter(function (val, i) { return i != selectionIndex_2; });
                                this.selectionChange.emit(this.selection);
                                this.onRowUnselect.emit({ originalEvent: event.originalEvent, data: rowData, type: 'row' });
                                if (dataKeyValue) {
                                    delete this.selectionKeys[dataKeyValue];
                                }
                            } else {
                                this._selection = this.selection ? this.selection.concat([rowData]) : [rowData];
                                this.selectionChange.emit(this.selection);
                                this.onRowSelect.emit({ originalEvent: event.originalEvent, data: rowData, type: 'row', index: event.rowIndex });
                                if (dataKeyValue) {
                                    this.selectionKeys[dataKeyValue] = 1;
                                }
                            }
                        }
                    }
                }
                this.tableService.onSelectionChange();
                if (this.isStateful()) {
                    this.saveState();
                }
            }
            this.rowTouched = false;
        };

    }
    
    flagChange(){ 
        setTimeout(() => {
          this._changeDetectorRef.detectChanges();
        });
      }
      
    selectedColumnChange(value: any[]) {
        this.savePageSetting('selected_columns', value);
    }

    setupEditableGrid() {
        $(document).on('keydown', '.ui-editing-cell input', this.editingCellKeydownEvent);
    }

    onPageChange(event) {
        this.pageSize = event.rows;
        this.page = event.first / event.rows + 1;
        this.searchValue.page = this.page;
        this.searchValue.pageSize = this.pageSize;
        this.search();
    }

    goToPage(event, page_number: any = null) {
        if ((event.type == 'click' || event.keyCode == 13) && this.totalPages > 0) {
            if (this.page > this.totalPages) {
                this.page = this.totalPages;
            } else if (this.page < 1) {
                this.page = 1;
            }
            this.searchValue.page = this.page;
            this.searchValue.pageSize = this.pageSize;
            this.search();
        }
    }

    onRowCollapse(row: any) {
        if (row.data.user_number == 0) {
            this.dataTable.toggleRow(row.data);
        }
    }

    filterInTable(event: any) {
        if (event.type == 'click' || event.keyCode == 13) {
            let container = $(event.target).closest('.datatable-container');
            if (this.globalFilterText.trim() != '') {
                (this.data || []).forEach(ds => {
                    if (Object.keys(ds).some(k => this.filterFields.indexOf(k) > -1
                        && ds[k] != null && ds[k].toString().toLowerCase().includes(this.globalFilterText.toLowerCase()))) {
                        let ele = container.find('.index_' + ds[this.dataKey]).closest('tr');
                        if (ele.closest('.ui-table-frozen-view')) {
                            ele.closest('.ui-table-scrollable-wrapper').find('.ui-table-unfrozen-view tbody tr').eq(ele.index()).show();
                        }
                        ds.hide = false;
                        ele.show();
                    } else {
                        let ele = container.find('.index_' + ds[this.dataKey]).closest('tr');
                        if (ele.closest('.ui-table-frozen-view')) {
                            ele.closest('.ui-table-scrollable-wrapper').find('.ui-table-unfrozen-view tbody tr').eq(ele.index()).hide();
                        }
                        ds.hide = true;
                        ele.hide();
                    }
                });
            } else {
                (this.data || []).forEach(ds => {
                    let ele = container.find('.index_' + ds[this.dataKey]).closest('tr');
                    if (ele.closest('.ui-table-frozen-view')) {
                        ele.closest('.ui-table-scrollable-wrapper').find('.ui-table-unfrozen-view tbody tr').eq(ele.index()).show();
                    }
                    ds.hide = false;
                    ele.show();
                });
            }
        }
    }

    filterInTablePress(event) {
        let container = $('.ui-table');
        if (this.globalFilterText.trim() != '') {
            this.data.forEach(ds => {
                if (Object.keys(ds).some(k => this.filterFields.indexOf(k) > -1
                    && ds[k] != null && this.slugify(ds[k].toString().toLowerCase()).includes(this.slugify(this.globalFilterText.toLowerCase())))) {
                    let ele = container.find('.index_' + ds[this.dataKey]).closest('tr');
                    if (ele.closest('.ui-table-frozen-view')) {
                        ele.closest('.ui-table-scrollable-wrapper').find('.ui-table-unfrozen-view tbody tr').eq(ele.index()).show();
                    }
                    ds.hide = false;
                    ele.show();
                    this.detectChange();
                } else {
                    let ele = container.find('.index_' + ds[this.dataKey]).closest('tr');
                    if (ele.closest('.ui-table-frozen-view')) {
                        ele.closest('.ui-table-scrollable-wrapper').find('.ui-table-unfrozen-view tbody tr').eq(ele.index()).hide();
                    }
                    ds.hide = true;
                    ele.hide();
                    this.detectChange();
                }
            });
        } else {
            this.data.forEach(ds => {
                let ele = container.find('.index_' + ds[this.dataKey]).closest('tr');
                if (ele.closest('.ui-table-frozen-view')) {
                    ele.closest('.ui-table-scrollable-wrapper').find('.ui-table-unfrozen-view tbody tr').eq(ele.index()).show();
                }
                ds.hide = false;
                ele.show();
                this.detectChange();
            });
        }
    }

    createTreeNodeInstance(item) {
        if (item.data == null) {
            item.parent = null;
            item.data = Object.assign({}, item);
            item.label = item[this.dataLabel];
            item.leaf = item.count_childs == null || item.count_childs == 0;
            item.expandedIcon = item.count_childs == null || item.count_childs == 0 ? 'fa-leaf' : 'fa-sitemap';
            item.collapsedIcon = item.count_childs == null || item.count_childs == 0 ? 'fa-leaf' : 'fa-sitemap';
        }
        return item;
    }

    // for callback after search
    search(searchInPanel: boolean = false, useSearchForm: boolean = true) {
        if (this.predicateBeforeSearch) {
            this.predicateBeforeSearch();
        }
        if (useSearchForm && this.searchFormGroup) {
            this.searchValue = this.searchFormGroup.value;
            if (this.bonusParams && this.bonusParams.length > 0) {
                this.bonusParams.forEach(ds => {
                    this.searchValue[ds.key] = ds.value;
                });
            }
        }
        // If search in form -> go to first page
        if (searchInPanel) {
            this.page = 1;
        }
        if (this.searchValue == null) {
            return;
        }
        this.searchValue.page = this.page;
        this.searchValue.pageSize = this.pageSize;
        if (!this.searching || this.allow_search_when_searching) {
            if (!this.breakSearch) {
                if (!this.keepSelectedOnChangePage) {
                    this.selectedDataTableItems = [];
                }
                // If using child API
                this.searching = true;
                if (this.loadBalancing) {
                    let apis = [];
                    if (this.loadTreeFromLocalFile) {
                        apis = [this._functionConstants.getJsonFile(this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')), 't', this.tableName,
                            this._apiService.post(SystemConstants.get('ADAPTER_API'), { Method: { Method: 'POST' }, Url: this.searchApiUrl, Module: this.APIModuleName, Data: JSON.stringify(this.searchValue) }),
                            this.loadTreeWithFacility, this.notByLanguageLabels
                        )];
                    } else {
                        apis = [this._apiService.post(SystemConstants.get('ADAPTER_API'), { Method: { Method: 'POST' }, Url: this.searchApiUrl, Module: this.APIModuleName, Data: JSON.stringify(this.searchValue) })];
                    }
                    if (this.isTree || this.isTreeTable) {
                        observableCombineLatest(apis).pipe(takeUntil(this.unsubscribe)).subscribe((x: any) => {
                            let res: any;
                            if (this.loadTreeFromLocalFile) {
                                res = x[0];
                            } else {
                                res = x[0].data;
                            }
                            this.data_table_tree = [];
                            this.originSource = [];
                            if (res != null) {
                                res.forEach(ds => {
                                    this.data_table_tree.push({
                                        'data': ds,
                                        'label': ds[this.dataLabel],
                                        'leaf': ds.count_childs == null || ds.count_childs == 0,
                                        'type': '',
                                        'expandedIcon': this.rootIcon,
                                        'collapsedIcon': this.rootIcon,
                                        'loaded': true,
                                        'children': ds.children
                                    });
                                    let tmp = $.extend(true, {}, ds);
                                    this.originSource.push({
                                        'data': tmp,
                                        'label': tmp[this.dataLabel],
                                        'leaf': tmp.count_childs == null || tmp.count_childs == 0,
                                        'type': '',
                                        'expandedIcon': this.rootIcon,
                                        'collapsedIcon': this.rootIcon,
                                        'loaded': true,
                                        'children': tmp.children
                                    });
                                });
                            }
                            this.executeRecursive(this.data_table_tree, (item) => {
                                item = this.createTreeNodeInstance(item);
                            });
                            this.executeRecursive(this.originSource, (item) => {
                                item = this.createTreeNodeInstance(item);
                            });
                            if (this.isTree || this.isTreeTable) {
                                // Storage node expanded state
                                let nodeExpandeds = this.filterDataToList(this.treeData, (item) => {
                                    item = this.createTreeNodeInstance(item);
                                    return item.expanded;
                                });
                                this.treeData = this.data_table_tree.map(ds => Object.assign({}, ds));
                                let currentNode = null;
                                if (nodeExpandeds) {
                                    // Keep expanded state on filtered list
                                    this.executeRecursive(this.treeData, (item) => {
                                        item = this.createTreeNodeInstance(item);
                                        if (nodeExpandeds.indexOf(item.data[this.dataKey]) > -1) {
                                            item.expanded = true;
                                        }
                                    });
                                    // Find selected node in filtered list
                                    if (this.selectedNode != null && this.treeData && this.treeData.length > 0) {
                                        for (let i = 0; i < this.treeData.length; i++) {
                                            currentNode = this.searchTree(this.treeData[i], (item) => {
                                                item = this.createTreeNodeInstance(item);
                                                return item.data[this.dataKey] == this.selectedNode.data[this.dataKey];
                                            });
                                            if (currentNode != null) {
                                                break;
                                            }
                                        }
                                    }
                                }
                                if (currentNode) {
                                    // Keep chosing if selected node exist in filtered list
                                    this.selectedNode = currentNode;
                                    setTimeout(() => {
                                        $('.node_' + this.selectedNode.data[this.dataKey]).closest('.ui-treenode-label').click();
                                    }, 100);
                                } else if (this.treeData && this.treeData.length > 0 && !this.selectedNode) {
                                    // If not exists focus to first node
                                    setTimeout(() => {
                                        $('.ui-tree-container > p-treenode > li .ui-treenode-label').first().click();
                                    }, 100);
                                }
                            }
                            if (this.allowSelectableDataKeys && this.allowSelectableDataKeys.length > 0) {
                                this.handlePermissionOnTree(this.treeData, this.allowSelectableDataKeys);
                                this.handlePermissionOnTree(this.data_table_tree, this.allowSelectableDataKeys);
                            }
                            // Do something after search

                            if (this.predicateAfterSearch) {
                                this.predicateAfterSearch(res);
                            }
                            this.searching = false;
                        }, error => this.searching = false);
                    } else {
                        this._apiService.post(SystemConstants.get('ADAPTER_API'), { Method: { Method: 'POST' }, Url: this.searchApiUrl, Module: this.APIModuleName, Data: JSON.stringify(this.searchValue) }).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
                            this.first = this.pageSize * (this.page - 1);
                            this.data = res.data;
                            // Keep origin source
                            this.originSource = $.extend(true, [], this.data);
                            // Make row same height (use for fixed datatable: grant role, ...)
                            if (this.makeRowSameHeightAfterLoad) {
                                setTimeout(() => {
                                    this.makeRowsSameHeight();
                                }, 100);
                            }
                            this.fromRecords = (this.page - 1) * this.pageSize + 1;
                            this.toRecords = (this.page - 1) * this.pageSize + this.data.length;
                            if (this.pageSize == 0) {
                                this.totalPages = 0;
                            } else {
                                this.totalPages = Math.ceil(res.totalItems / this.pageSize);
                            }
                            this.totalRecords = res.totalItems;
                            this._translateService.get('COMMON.page_label').subscribe((message: string) => {
                                this.pageLabel = message.replace('{fromRecords}', (this.fromRecords || 0).toString())
                                    .replace('{toRecords}', (this.toRecords || 0).toString())
                                    .replace('{totalRecords}', (this.totalRecords || 0).toString());
                            });
                            // Do something after search
                            if (this.predicateAfterSearch) {
                                this.predicateAfterSearch(res);
                            }
                            this.searching = false;
                            if (this.totalPages > 0 && this.page > this.totalPages) {
                                this.page = this.totalPages;
                                this.search();
                            }
                        }, error => this.searching = false);
                    }
                } else {
                    this._apiService.post(this.searchApiUrl, this.searchValue).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
                        this.first = this.pageSize * (this.page - 1);
                        this.data = res.data;
                        // Make row same height (use for fixed datatable: grant role, ...)
                        if (this.makeRowSameHeightAfterLoad) {
                            setTimeout(() => {
                                this.makeRowsSameHeight();
                            }, 100);
                        }
                        this.fromRecords = (this.page - 1) * this.pageSize + 1;
                        this.toRecords = (this.page - 1) * this.pageSize + this.data.length;
                        if (this.pageSize == 0) {
                            this.totalPages = 0;
                        } else {
                            this.totalPages = Math.ceil(res.totalItems / this.pageSize);
                        }
                        this.totalRecords = res.totalItems;
                        this.searching = false;
                        this._translateService.get('COMMON.page_label').subscribe((message: string) => {
                            this.pageLabel = message.replace('{fromRecords}', (this.fromRecords || 0).toString())
                                .replace('{toRecords}', (this.toRecords || 0).toString())
                                .replace('{totalRecords}', (this.totalRecords || 0).toString());
                        });
                    }, error => this.searching = false);
                }
            }
        }

    }

    exportToExcel() {
        if (this.loadBalancing) {
            this.searchValue.pageSize = 0;
            this._apiService.post(SystemConstants.get('ADAPTER_API'), {
                Method: { Method: 'POST' },
                Url: this.exportUrl,
                Module: this.APIModuleName,
                Data: JSON.stringify(this.searchValue)
            }, true, true).pipe(takeUntil(this.unsubscribe)).subscribe(fileData => {
                FileSaver.saveAs(fileData, this.exportFilename);
            });
        } else {
            this._apiService.downloadFile(this.exportUrl, this.exportFilename);
        }
    }

    exportToExcelwithURL(url, filename) {
        if (this.loadBalancing) {
            this.searchValue.pageSize = 0;
            this._apiService.post(SystemConstants.get('ADAPTER_API'), {
                Method: { Method: 'POST' },
                Url: url,
                Module: this.APIModuleName,
                Data: JSON.stringify(this.searchValue)
            }, true, true).pipe(takeUntil(this.unsubscribe)).subscribe(fileData => {
                FileSaver.saveAs(fileData, filename);
            });
        } else {
            this._apiService.downloadFile(url, filename);
        }
    }

    makeRowsSameHeight() {
        setTimeout(() => {
            if ($('.ui-table-scrollable-wrapper').length) {
                let wrapper = $('.ui-table-scrollable-wrapper');
                wrapper.each(function () {
                    let w = $(this);
                    let frozen_rows: any = w.find('.ui-table-frozen-view tr');
                    let unfrozen_rows = w.find('.ui-table-unfrozen-view tr');
                    for (let i = 0; i < frozen_rows.length; i++) {
                        if (frozen_rows.eq(i).height() > unfrozen_rows.eq(i).height()) {
                            unfrozen_rows.eq(i).height(frozen_rows.eq(i).height());
                        } else if (frozen_rows.eq(i).height() < unfrozen_rows.eq(i).height()) {
                            frozen_rows.eq(i).height(unfrozen_rows.eq(i).height());
                        }
                    }
                });
            }
        });
    }

    searchTree(element, predicate) {
        if (predicate(element)) {
            return element;
        } else if (element.children != null) {
            let i;
            let result = null;
            for (i = 0; result == null && i < element.children.length; i++) {
                result = this.searchTree(element.children[i], predicate);
            }
            return result;
        }
        return null;
    }

    detectChange() {
        if (!this._changeDetectorRef['destroyed']) {
            this._changeDetectorRef.detectChanges();
        }
    }

    nodeExpand(event) {
        if (this.treeLoadedAll) {
            // if (event.node.children) {
            //     event.node.children.forEach(ds => {
            //         ds = this.createTreeNodeInstance(ds);
            //     });
            // }
        } else {
            if (event.node && !event.node.loaded) {
                if (this.loadBalancing) {
                    this._apiService.post(SystemConstants.get('ADAPTER_API'), {
                        Method: {
                            Method: 'GET'
                        },
                        Url: this.getListByIdApiUrl + event.node.data[this.dataKey],
                        Module: this.APIModuleName
                    }).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
                        let node = null;
                        for (let i = 0; i < this.data_table_tree.length; i++) {
                            node = this.searchTree(this.data_table_tree[i], (item) => {
                                return item.data[this.dataKey] == event.node.data[this.dataKey];
                            });
                        }
                        node.loaded = true;
                        node.expanded = true;
                        if (res.data.length > 0) {
                            node.children = [];
                            res.data.forEach(ds => {
                                node.children.push({
                                    'data': ds,
                                    // 'label': ds[this.dataLabel],
                                    'label': ds[this.dataLabel] == null ? (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'local' ? ds[this.dataLabel] = ds[this.dataLabel + '_l'] : ds[this.dataLabel] = ds[this.dataLabel + '_e']) : ds[this.dataLabel],
                                    'leaf': ds.count_childs == null || ds.count_childs == 0,
                                    'type': '',
                                    'expandedIcon': ds.count_childs == null || ds.count_childs == 0 ? 'fa-leaf' : 'fa-sitemap',
                                    'collapsedIcon': ds.count_childs == null || ds.count_childs == 0 ? 'fa-leaf' : 'fa-sitemap',
                                    'children': [],
                                    'loaded': false
                                });
                            });
                        } else {
                            node.leaf = true;
                            node.type = 'leaf';
                        }
                        if (this.isTree) {
                            this.filterTree();
                        }
                        this.detectChange();
                    });
                } else {
                    this._apiService.get(this.getListByIdApiUrl + event.node.data[this.dataKey]).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
                        event.node.loaded = true;
                        event.node.expanded = true;
                        if (res.data.length > 0) {
                            event.node.children = [];
                            res.data.forEach(ds => {
                                event.node.children.push({
                                    'data': ds,
                                    // 'label': ds[this.dataLabel],
                                    'label': ds[this.dataLabel] == null ? (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'local' ? ds[this.dataLabel] = ds[this.dataLabel + '_l'] : ds[this.dataLabel] = ds[this.dataLabel + '_e']) : ds[this.dataLabel],
                                    'leaf': ds.count_childs == null || ds.count_childs == 0,
                                    'type': '',
                                    'expandedIcon': 'fa-empire',
                                    'collapsedIcon': 'fa-empire',
                                    'children': [],
                                    'loaded': false
                                });
                            });
                        } else {
                            event.node.leaf = true;
                            event.node.type = 'leaf';
                        }
                        if (this.isTree) {
                            this.filterTree();
                        }
                        this.detectChange();
                    });
                }
            }
        }
    }

    nodeIndex(node, data_tree_table = false) {
        let index: number;
        if (node.parent) {
            index = node.parent.children.filter(it => !it.data.hidden).indexOf(node) + 1;
            node.data.index = index;
            return (this.nodeIndex(node.parent, data_tree_table)) + index + '.';
        }
        if (!data_tree_table) {
            index = this.treeData.findIndex(ds => ds.data[this.dataKey] == node.data[this.dataKey]) + 1;
        } else {
            index = this.data_table_tree.filter(it => !it.data.hidden).findIndex(ds => ds.data[this.dataKey] == node.data[this.dataKey]) + 1;
        }
        node.data.index = index;
        return index + '.';
    }

    toggleNode(node) {
        let elm = $('.expand_index_' + node.item_group_id + ' a');
        if (elm.length > 0) {
            elm[0].click();
        }
    }

    filterData(data, predicate) {
        // if no data is sent in, return null, otherwise transform the data
        return !!!data ? null : data.reduce((list, entry) => {
            let clone = null;
            if (predicate(entry)) {
                // if the object matches the filter, clone it as it is
                clone = Object.assign({}, entry);
            }
            if (entry.children != null) {
                // if the object has childrens, filter the list of children
                let children = this.filterData(entry.children, predicate);
                if (children.length > 0) {
                    // if any of the children matches, clone the parent object, overwrite
                    // the children list with the filtered list
                    if (clone == null) {
                        clone = Object.assign({}, entry, { expanded: true, children: children });
                    } else {
                        clone.children = children;
                    }
                }
            }
            // if there's a cloned object, push it to the output list
            if (clone) {
                list.push(clone);
            }
            return list;
        }, []);
    }

    /**
     * Filter list by condition and add to not hiearchy list
     * @param data List to filter
     * @param predicate Condition
     */
    filterDataToList(data, predicate) {
        return !!!data ? null : data.reduce((list, entry) => {
            let clone = null;
            if (predicate(entry)) {
                list.push(entry.data[this.dataKey]);
            }
            if (entry.children != null) {
                // if the object has childrens, filter the list of children
                let children = this.filterDataToList(entry.children, predicate).filter(ds => ds != null);
                if (children && children.length > 0) {
                    children.forEach(ds => {
                        if (ds.data) {
                            list.push(ds);
                        } else {
                            list.push(ds);
                        }
                    });
                }
            }
            return list;
        }, []);
    }

    handlePermissionOnTree(data: any[], data_keys: any[]) {
        if (data_keys && data_keys.length > 0) {
            this.executeRecursive(data, (item) => {
                if (item.data) {
                    item.selectable = data_keys.indexOf(item.data[this.dataKey]) > -1;
                } else {
                    item.selectable = data_keys.indexOf(item[this.dataKey]) > -1;
                }
            });
        }
    }

    executeRecursive(data, predicate) {
        return !!!data ? null : data.reduce((list, entry) => {
            predicate(entry);
            if (entry.children != null) {
                this.executeRecursive(entry.children, predicate);
            }
            return list;
        }, []);
    }

    executeRecursiveAfter(data, predicate) {
        return !!!data ? null : data.reduce((list, entry) => {
            if (entry.children != null) {
                this.executeRecursiveAfter(entry.children, predicate);
            }
            predicate(entry);
            return list;
        }, []);
    }

    filterTree() {
        // Storage node expanded state
        let nodeExpandeds = this.filterDataToList(this.treeData, (item) => {
            item = this.createTreeNodeInstance(item);
            return item.expanded;
        });
        // Filter
        let kw: string = this.treeFilterText;
        if (kw == null || kw.trim() == '') {
            this.treeData = (this.data_table_tree || []).map(ds => Object.assign({}, ds));
        } else {
            let subfix = this._storageService.getItem('data_lang') == 'local' ? '_l' : '_e';
            this.treeData = this.filterData(this.data_table_tree, (item) => {
                item = this.createTreeNodeInstance(item);
                return ('' + item.data[this.dataLabel + (this.callbackWhenSelectNode || this.notDualLanguage ? '' : subfix)]).toLowerCase().indexOf(('' + kw).toLowerCase()) > -1;
            });
            if (this.treeData && this.treeData.length > 0) {
                this.treeData.forEach(ds => {
                    this.expandRecursive(ds, true);
                });
            }
        }
        // Keep expanded state on filtered list
        if (nodeExpandeds) {
            this.executeRecursive(this.treeData, (item) => {
                if (item.data) {
                    if (nodeExpandeds.indexOf(item.data[this.dataKey]) > -1) {
                        item.expanded = true;
                    }
                } else {
                    if (nodeExpandeds.indexOf(item[this.dataKey]) > -1) {
                        item.expanded = true;
                    }
                }
            });
        }
        // Find selected node in filtered list
        let currentNode = null;
        if (this.selectedNode != null && this.treeData && this.treeData.length > 0) {
            for (let i = 0; i < this.treeData.length; i++) {
                currentNode = this.searchTree(this.treeData[i], (item) => {
                    item = this.createTreeNodeInstance(item);
                    return item.data[this.dataKey] == this.selectedNode.data[this.dataKey];
                });
                if (currentNode != null) {
                    break;
                }
            }
        }
        if (currentNode) {
            // Keep chosing if selected node exist in filtered list
            this.selectedNode = currentNode;
        } else if (this.treeData && this.treeData.length > 0) {
            // If not exists focus to first node
            setTimeout(() => {
                $('.ui-treenode-label').first().click();
            }, 100);
        }
    }

    saveEditableGrid() {
        let result = this._functionConstants.compare(this.originSource, this.data_table_tree, this.dataKey);
        // console.log(result);
    }

    tableSort(source, field, order) {
        return source.sort((data1, data2) => {
            let value1 = data1[field];
            let value2 = data2[field];
            let result = null;
            if (value1 == null && value2 != null) {
                result = -1;
            } else if (value1 != null && value2 == null) {
                result = 1;
            } else if (value1 == null && value2 == null) {
                result = 0;
            } else if (typeof value1 === 'string' && typeof value2 === 'string') {
                result = value1.localeCompare(value2);
            } else {
                result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
            }
            return (order * result);
        });
    }

    // for treeTable
    treeSort(source, field, field2, order) {
        return source.sort((data1, data2) => {
            let value1 = data1.data[field];
            let value2 = data2.data[field];
            let vfield1 = data1.data[field2];
            let vfield2 = data2.data[field2];
            let result = null;
            if (value1 == null && value2 != null) {
                result = 1;
            } else if (value1 != null && value2 == null) {
                result = -1;
            } else if (value1 == null && value2 == null) {
                result = 0;
            } else if (typeof value1 === 'string' && typeof value2 === 'string') {
                result = value1.localeCompare(value2);
            } else {
                result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
            }
            if (result == 0) {

                if (vfield1 == null && vfield2 != null) {
                    result = 1;
                } else if (vfield1 != null && vfield2 == null) {
                    result = -1;
                } else if (vfield1 == null && vfield2 == null) {
                    result = 0;
                } else if (typeof vfield1 === 'string' && typeof vfield2 === 'string') {
                    result = vfield1.localeCompare(vfield2);
                } else {
                    result = (vfield1 < vfield2) ? -1 : (vfield1 > vfield2) ? 1 : 0;
                }

            }


            return (order * result);
        });
    }

    public AddItemNode(item: any, detectChange = true) {
        let parentId = item.parent_item_group_id;
        let treeitem = {
            'data': item,
            'label': item[this.dataLabel],
            // 'label': item[this.dataLabel] == null ? (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'local' ? item[this.dataLabel] = item[this.dataLabel + '_l'] : item[this.dataLabel] = item[this.dataLabel + '_e']) : item[this.dataLabel],
            'leaf': item.count_childs == null || item.count_childs == 0,
            'type': '',
            'expandedIcon': item.count_childs == null || item.count_childs == 0 ? 'fa-leaf' : 'fa-sitemap',
            'collapsedIcon': item.count_childs == null || item.count_childs == 0 ? 'fa-leaf' : 'fa-sitemap',
            'children': [],
            'loaded': false
        };
        let parent = null;
        parent = this.searchIndataTree(this.data_table_tree, (item) => {
            item = this.createTreeNodeInstance(item);
            return item.data.item_group_id == parentId;
        });
        if (parent == null) {
            this.createTreeNodeInstance(treeitem);
            this.data_table_tree.push(treeitem);
            this.treeSort(this.data_table_tree, 'seq_num', this.dataLabel, 1);
            this.data_table_tree = [...this.data_table_tree];
        } else {
            if (parent.children == null) {
                parent.children = [];
            }
            parent.data.count_childs += 1;
            this.createTreeNodeInstance(treeitem);
            parent.children.push(treeitem);
            this.createTreeNodeInstance(parent);
            this.treeSort(parent.children, 'seq_num', this.dataLabel, 1);
            this.data_table_tree = [...this.data_table_tree];
        }
        this.data_table_tree = [...this.data_table_tree];
        if (detectChange) {
            this.filterDataTreeTable(false);
            this.detectChange();
        }
    }

    public UpdateItemNode(itemUpd: any, detectChange = true) {
        if (this.origin_parent == itemUpd.parent_item_group_id) {
            if (itemUpd.parent_item_group_id == null || itemUpd.parent_item_group_id == '') {
                this.data_table_tree.forEach(element => {
                    if (element.data.item_group_id == itemUpd.item_group_id) {
                        let childrendata = [];
                        if (element.data.children) {
                            childrendata = [...element.data.children];
                        }
                        itemUpd.children = childrendata;
                        element.data = itemUpd;
                        this.treeSort(this.data_table_tree, 'seq_num', this.dataLabel, 1);
                    }
                });
            } else {
                let parent = null;
                parent = this.searchIndataTree(this.data_table_tree, (item) => {
                    item = this.createTreeNodeInstance(item);
                    return item.data.item_group_id == itemUpd.parent_item_group_id;
                });
                if (parent != null) {
                    if (parent.children != null) {
                        let index = parent.children.findIndex(x => x.item_group_id == itemUpd.item_group_id);
                        if (index > -1) {
                            let childrendata = [];
                            if (parent.children[index].data.children) {
                                childrendata = [...parent.children[index].data.children];
                            }
                            itemUpd.children = childrendata;
                            parent.children[index].data = itemUpd;
                            if (parent.children) {
                                this.createTreeNodeInstance(parent);
                                this.treeSort(parent.children, 'seq_num', this.dataLabel, 1);
                            }
                        }
                    }
                }
            }
            this.data_table_tree = [...this.data_table_tree];
            if (detectChange) {
                this.detectChange();
            }
        } else {
            let originNode = null;
            originNode = this.searchIndataTree(this.data_table_tree, (item) => {
                item = this.createTreeNodeInstance(item);
                return item.data.item_group_id == itemUpd.item_group_id;
            });
            if (originNode) {
                let childrenData = [];
                if (originNode.data.children) {
                    childrenData = [...originNode.data.children];
                }
                let updateItem = Object.assign({}, originNode);
                updateItem.data = itemUpd;
                updateItem.data.children = childrenData;
                this.RemoveItemNode([originNode.data], true);
                if (itemUpd.parent_item_group_id == null || itemUpd.parent_item_group_id == '') {
                    this.data_table_tree.push(updateItem);
                    this.treeSort(this.data_table_tree, 'seq_num', this.dataLabel, 1);
                } else {
                    let parentNode = null;
                    parentNode = this.searchIndataTree(this.data_table_tree, (item) => {
                        item = this.createTreeNodeInstance(item);
                        return item.data.item_group_id == itemUpd.parent_item_group_id;
                    });
                    if (parentNode != null) {
                        if (parentNode.children == null) {
                            parentNode.children = [];
                        }
                        if (parentNode.data.children == null) {
                            parentNode.data.children = [];
                        }
                        parentNode.children.push(updateItem);
                        parentNode.data.count_childs += 1;
                        this.createTreeNodeInstance(parentNode);
                        this.treeSort(parentNode.children, 'seq_num', this.dataLabel, 1);
                    }
                }
                this.data_table_tree = [...this.data_table_tree];
                this.detectChange();
            }

        }
        this.filterDataTreeTable(false);
    }

    public RemoveItemNode(items: any[], detectChange = true) {
        items.forEach(element => {
            let parent = null;
            for (let index = 0; index < this.data_table_tree.length; index++) {
                if (this.data_table_tree[index].data.item_group_id == element.item_group_id) {
                    this.data_table_tree.splice(index, 1);
                } else if (element.parent_item_group_id != null && element.parent_item_group_id != '') {
                    parent = this.searchTree(this.data_table_tree[index], (item) => {
                        item = this.createTreeNodeInstance(item);
                        return item.data.item_group_id == element.parent_item_group_id;
                    });
                    if (parent != null) {
                        let idx = parent.children.findIndex(x => x.data.item_group_id == element.item_group_id);
                        if (idx > -1) {
                            parent.children.splice(idx, 1);
                            parent.data.count_childs -= 1;
                            if (parent.data.count_childs < 1) {
                                parent.leaf = true;
                            }
                            this.createTreeNodeInstance(parent);
                        }

                    }
                }
            }
        });
        this.data_table_tree = [...this.data_table_tree];
        if (detectChange) {
            this.detectChange();
        }
    }

    public ExecuteToParent(item, predicate) {
        predicate(item);
        if (item.parent != null) {
            this.executeRecursive(item.parent, predicate);
        }
    }

    public searchIndataTree(data: any[], predicate) {
        for (let index = 0; index < data.length; index++) {
            if (predicate(data[index])) {
                return data[index];
            } else {
                let item = this.searchTree(data[index], predicate);
                if (item != null) {
                    return item;
                }
            }
        }
        return null;
    }

    public filterDataTreeTable(collapse = true) {
        let kw = this.globalFilterText.trim();
        this.executeRecursiveAfter(this.data_table_tree, (item) => {
            let countChildvisiable = item.children == null ? 0 : item.children.filter(it => !it.data.hidden).length;
            if (kw == '' || countChildvisiable > 0) {
                if (countChildvisiable > 0) {
                    item.leaf = false;
                    if (kw != '') {
                        item.expanded = true;
                    } else if (collapse) {
                        item.expanded = false;
                    }
                } else {
                    item.leaf = true;
                }

                item.data.hidden = false;
            } else {
                if (Object.keys(item.data).some(k => this.filterFields.indexOf(k) > -1
                    && item.data[k] != null && item.data[k].toString().toLowerCase().includes(kw.toLocaleLowerCase()))) {
                    item.data.hidden = false;
                    item.leaf = true;
                } else {
                    item.data.hidden = true;
                }
            }
        });
        this.data_table_tree = [...this.data_table_tree];
        this.detectChange();
    }

    public GenerateDropDownfromTree(array: any[], level = 0, dropdown = [], keystruct = '') {
        for (let index = 0; index < array.length; index++) {
            let item = array[index];
            let item_group_id = item.data ? item.data.item_group_id : item.item_group_id;
            let item_group_name = item.data ? item.data.item_group_name : item.item_group_name;
            dropdown.push({
                label: item_group_name,
                value: item_group_id,
                level: level,
                keystruct: keystruct
            });
            if (item.children != null && item.children) {
                this.GenerateDropDownfromTree(item.children, level + 1, dropdown, keystruct + '/' + item_group_id);
            }
        }
        return dropdown;
    }

    GetTreeFromurl(filename, url_api, addAll = false, labelfield = 'item_group_name') {
        return this._functionConstants.getJsonFile(this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')), 't', filename,
            this._apiService.post(SystemConstants.get('ADAPTER_API'), { Method: { Method: 'POST' }, Url: url_api, Module: this.APIModuleName, Data: JSON.stringify({}) }),
            this.loadTreeWithFacility, this.notByLanguageLabels
        ).pipe(map(x => {
            let res = x;
            let treeitem = [];
            res.forEach(ds => {
                treeitem.push({
                    'data': ds,
                    'label': ds[labelfield],
                    'leaf': ds.count_childs == null || ds.count_childs == 0,
                    'type': '',
                    'expandedIcon': this.rootIcon,
                    'collapsedIcon': this.rootIcon,
                    'loaded': true,
                    'children': ds.children
                });
            });
            this.executeRecursive(treeitem, (item) => {
                item = this.createTreeNodeInstance(item);
                item.label = item.data[labelfield];
            });
            this.treeSort(treeitem, 'seq_num', labelfield, 1);
            this.executeRecursive(treeitem, (item) => {
                item.leaf = item.data.children == null || item.data.children.length == 0;
                if (item.children) {
                    this.treeSort(item.children, 'seq_num', labelfield, 1);
                }
            });
            if (addAll) {
                treeitem.unshift({
                    'data': { item_group_id: null },
                    'label': this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'local' ? 'Tất cả' : 'All', // hash
                    'leaf': true,
                    'type': '',
                    'expandedIcon': this.rootIcon,
                    'collapsedIcon': this.rootIcon,
                    'loaded': true,
                    'children': []
                });
            }
            return treeitem;
        }));
    }

    updatePaginator(totalRecords) {
        this.fromRecords = (this.page - 1) * this.pageSize + 1;
        this.toRecords = (this.page - 1) * this.pageSize + this.data.length;
        if (this.pageSize == 0) {
            this.totalPages = 0;
        } else {
            this.totalPages = Math.ceil(totalRecords / this.pageSize);
        }
        this.totalRecords = totalRecords;
        this._translateService.get('COMMON.page_label').subscribe((message: string) => {
            this.pageLabel = message.replace('{fromRecords}', (this.fromRecords || 0).toString())
                .replace('{toRecords}', (this.toRecords || 0).toString())
                .replace('{totalRecords}', (this.totalRecords || 0).toString());
        });
    }

    setupEditing() {
        this.dataTable.bindDocumentEditListener = () => {
            if (!this.dataTable.documentEditListener) {
                this.dataTable.documentEditListener = (event) => {
                    if (this.dataTable.editingCell && !this.dataTable.editingCellClick && this.dataTable.isEditingCellValid()) {
                        DomHandler.removeClass(this.dataTable.editingCell, 'ui-editing-cell');
                        this.dataTable.editingCell = null;
                        this.dataTable.unbindDocumentEditListener();
                        this._changeDetectorRef.detectChanges();
                    }
                    this.dataTable.editingCellClick = false;
                };
                document.addEventListener('click', this.dataTable.documentEditListener);
            }
        };
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        $(document).off('keydown', '.ui-editing-cell input', this.editingCellKeydownEvent);
    }

}
