// import 'Styles/PrimeDataTable.css';
import React, {
  useState,
  useEffect,
  useRef,
  Fragment,
  useContext,
} from 'react';
import Image from 'next/image';
import { Col, Row as AntRow } from 'antd';
import { OverlayPanel } from 'primereact/overlaypanel';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { saveAs } from 'file-saver';
import {
  VuroxLayout,
  HeaderLayout,
  VuroxSidebar,
  ContentLayout,
} from '../components/core/Layout.component';

// import HeaderDark from 'Templates/HeaderDark';
// import Sidebar from 'Templates/HeaderSidebar';
import { VuroxBreadcrumbs } from '../components/common/Breadcrumbs.component';
import { vuroxContext } from '../context';

const DataTableDemo = (props) => {
  const [editedName, setEditedName] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [customers, setCustomers] = useState(props.customers);
  const [expandedRows, setExpandedRows] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState(null);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [selectedRepresentatives, setSelectedRepresentatives] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [groupBy, setGroupBy] = useState('name');
  const dt = useRef(null);
  const toast = useRef(null);
  const op = useRef(null);

  useEffect(() => {
    if (columns.length > 0) {
      setSelectedColumns(columns);
      return;
    }

    setColumns([
      {
        field: 'name',
        header: 'Name',
        body: nameBodyTemplate,
        sortable: true,
        filter: true,
        filterPlaceholder: 'Search by name',
        editor: (props) => nameEditor('name', props),
      },

      {
        field: 'country.name',
        sortField: 'country.name',
        filterField: 'country.name',
        header: 'Country',
        body: countryBodyTemplate,
        sortable: true,
        filter: true,
        filterMatchMode: 'contains',
        filterPlaceholder: 'Search by country',
      },

      {
        field: 'representative.name',
        sortField: 'representative.name',
        filterField: 'representative.name',
        header: 'Representative',
        body: representativeBodyTemplate,
        sortable: true,
        filter: true,
        filterElement: representativeFilterElement,
      },

      {
        field: 'date',
        header: 'Date',
        body: dateBodyTemplate,
        sortable: true,
        filter: true,
        filterMatchMode: 'custom',
        filterFunction: filterDate,
        filterElement: dateFilterElement,
      },
      {
        field: 'status',
        header: 'Status',
        body: statusBodyTemplate,
        sortable: true,
        filter: true,
        filterElement: statusFilterElement,
      },
    ]);
  }, [columns]);

  const representatives = [
    { name: 'Amy Elsner', image: 'amyelsner.png' },
    { name: 'Anna Fali', image: 'annafali.png' },
    { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
    { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
    { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
    { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
    { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
    { name: 'Onyama Limba', image: 'onyamalimba.png' },
    { name: 'Stephen Shaw', image: 'stephenshaw.png' },
    { name: 'XuXue Feng', image: 'xuxuefeng.png' },
  ];
  const statuses = [
    'unqualified',
    'qualified',
    'new',
    'negotiation',
    'renewal',
    'proposal',
  ];

  const dataTableFuncMap = {
    name: setEditedName,
  };

  const renderHeader = () => {
    return (
      <>
        <div className="row container">
          <div className="col-sm-12 col-md-3">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                type="search"
                onInput={(e) => setGlobalFilter(e.target.value)}
                placeholder="Global Search"
                className="col-sm-12"
              />
            </span>
          </div>
          {columns.length > 0 && (
            <MultiSelect
              value={selectedColumns}
              options={columns}
              optionLabel="header"
              onChange={onColumnToggle}
              className="col-sm-12 col-md-3"
            />
          )}
          <Button
            type="button"
            onClick={(e) => op.current.toggle(e)}
            className="col-sm-12 col-md-2"
          >
            Group by
          </Button>

          <div className="col-sm-12 col-md-4">
            <span className="mr-2">Export as</span>
            <Button
              type="button"
              icon="pi pi-file-o"
              onClick={() => exportCSV(false)}
              className="mr-2"
              data-pr-tooltip="CSV"
            />
            <Button
              type="button"
              icon="pi pi-file-excel"
              onClick={exportExcel}
              className="p-button-success mr-2"
              data-pr-tooltip="XLS"
            />
            <Button
              type="button"
              icon="pi pi-file-pdf"
              onClick={exportPdf}
              className="p-button-warning p-mr-2"
              data-pr-tooltip="PDF"
            />
          </div>
        </div>
        <OverlayPanel ref={op} dismissable>
          {columns.map((column) => {
            return (
              <div
                key={column.field}
                className="p-field-radiobutton"
                style={{ lineHeight: '.3rem', marginBottom: '.7rem' }}
              >
                <RadioButton
                  inputId={column.field}
                  name={column.field}
                  value={column.header}
                  onChange={() => {
                    setGroupBy(column.field);
                  }}
                  checked={column.field === groupBy}
                />
                <label style={{ marginLeft: '.3rem' }} htmlFor={column.field}>
                  {column.header}
                </label>
              </div>
            );
          })}
        </OverlayPanel>
      </>
    );
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <span className="p-column-title">Status</span>
        <span
          className={classNames('customer-badge', 'status-' + rowData.status)}
        >
          {rowData.status}
        </span>
      </React.Fragment>
    );
  };

  const nameBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <span className="p-column-title">Name</span>
        {rowData.name}
      </React.Fragment>
    );
  };

  const countryBodyTemplate = (rowData) => {
    let { name } = rowData.country;
    return (
      <React.Fragment>
        <span className="p-column-title">Country</span>
        <span style={{ verticalAlign: 'middle', marginLeft: '.5em' }}>
          {name}
        </span>
      </React.Fragment>
    );
  };

  const representativeBodyTemplate = (rowData) => {
    const src = rowData.representative.image;

    return (
      <React.Fragment>
        <span className="p-column-title">Representative</span>
        <Image
          alt={rowData.representative.name}
          src={src}
          width="32"
          style={{ verticalAlign: 'middle' }}
        />
        <span style={{ verticalAlign: 'middle', marginLeft: '.5em' }}>
          {rowData.representative.name}
        </span>
      </React.Fragment>
    );
  };

  const dateBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <span className="p-column-title">Date</span>
        <span>{rowData.date}</span>
      </React.Fragment>
    );
  };

  const renderRepresentativeFilter = () => {
    return (
      <MultiSelect
        className="p-column-filter"
        value={selectedRepresentatives}
        options={representatives}
        onChange={onRepresentativeFilterChange}
        itemTemplate={representativeItemTemplate}
        placeholder="All"
        optionLabel="name"
        optionValue="name"
      />
    );
  };

  const representativeItemTemplate = (option) => {
    const src = 'showcase/demo/images/avatar/' + option.image;

    return (
      <div className="p-multiselect-representative-option">
        <Image
          alt={option.name}
          src={src}
          width="32"
          style={{ verticalAlign: 'middle' }}
        />
        <span style={{ verticalAlign: 'middle', marginLeft: '.5em' }}>
          {option.name}
        </span>
      </div>
    );
  };

  const onRepresentativeFilterChange = (event) => {
    dt.current.filter(event.value, 'representative.name', 'in');
  };

  const renderDateFilter = () => {
    return (
      <Calendar
        value={dateFilter}
        onChange={onDateFilterChange}
        placeholder="Registration Date"
        dateFormat="yy-mm-dd"
        className="p-column-filter"
      />
    );
  };

  const onDateFilterChange = (event) => {
    if (event.value !== null)
      dt.current.filter(formatDate(event.value), 'date', 'equals');
    else dt.current.filter(null, 'date', 'equals');

    setDateFilter(event.value);
  };

  const filterDate = (value, filter) => {
    if (
      filter === undefined ||
      filter === null ||
      (typeof filter === 'string' && filter.trim() === '')
    ) {
      return true;
    }

    if (value === undefined || value === null) {
      return false;
    }

    return value === formatDate(filter);
  };

  const formatDate = (date) => {
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 10) {
      month = '0' + month;
    }

    if (day < 10) {
      day = '0' + day;
    }

    return date.getFullYear() + '-' + month + '-' + day;
  };

  const renderStatusFilter = () => {
    return (
      <Dropdown
        value={selectedStatus}
        options={statuses}
        onChange={onStatusFilterChange}
        itemTemplate={statusItemTemplate}
        showClear
        placeholder="Select a Status"
        className="p-column-filter"
      />
    );
  };

  const statusItemTemplate = (option) => {
    return (
      <span className={classNames('customer-badge', 'status-' + option)}>
        {option}
      </span>
    );
  };

  const onStatusFilterChange = (event) => {
    dt.current.filter(event.value, 'status', 'equals');
    setSelectedStatus(event.value);
  };

  const onEditorValueChange = (productKey, props, value) => {
    let updatedProducts = [...props.value];
    updatedProducts[props.rowIndex][props.field] = value;
    dataTableFuncMap[`${productKey}`](updatedProducts);
  };

  const inputTextEditor = (productKey, props, field) => {
    return (
      <InputText
        type="text"
        value={props.rowData[field]}
        onChange={(e) => onEditorValueChange(productKey, props, e.target.value)}
      />
    );
  };

  const nameEditor = (productKey, props) => {
    return inputTextEditor(productKey, props, 'name');
  };

  const onColReorder = (e) => {
    toast.current.show({
      severity: 'success',
      summary: 'Column Reordered',
      life: 3000,
    });
  };

  const onRowReorder = (e) => {
    setCustomers(e.value);
  };

  const dynamicColumns = selectedColumns.map((col, i) => {
    return (
      <Column
        key={col.field}
        columnKey={col.field}
        {...col}
        style={{ cursor: 'pointer' }}
      />
    );
  });

  const onColumnToggle = (event) => {
    let selectedColumns = event.value;
    let orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some((sCol) => sCol.field === col.field)
    );
    setSelectedColumns(orderedSelectedColumns);
  };

  const saveAsExcelFile = (buffer, fileName) => {
    let EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  };

  const exportCSV = (selectionOnly) => {
    dt.current.exportCSV({ selectionOnly });
  };

  const exportColumns = columns.map((col) => ({
    title: col.header,
    dataKey: col.field,
  }));

  const exportPdf = () => {
    import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF.default(0, 0);
        doc.autoTable(exportColumns, customers);
        doc.save('customers.pdf');
      });
    });
  };

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(customers);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      saveAsExcelFile(excelBuffer, 'customers');
    });
  };

  const onCustomSaveState = (state) => {
    if (typeof window === 'object') {
      // browser code
      // Since Nextjs runs this on server side
      // hence wont find the window object
      window.sessionStorage.setItem(
        'dt-state-demo-custom',
        JSON.stringify(state)
      );
    }
  };

  const onCustomRestoreState = () => {
    if (typeof window === 'object') {
      // browser code
      // Since Nextjs runs this on server side
      // hence wont find the window object
      return JSON.parse(window.sessionStorage.getItem('dt-state-demo-custom'));
    }
  };

  const onRowGroupExpand = (event) => {
    toast.current.show({
      severity: 'info',
      summary: 'Row Group Expanded',
      detail: 'Value: ' + event.data.representative.name,
      life: 3000,
    });
  };

  const onRowGroupCollapse = (event) => {
    toast.current.show({
      severity: 'success',
      summary: 'Row Group Collapsed',
      detail: 'Value: ' + event.data.representative.name,
      life: 3000,
    });
  };

  const headerTemplate = (data) => {
    let splitGroup = groupBy.split('.');
    return (
      <React.Fragment>
        <span className="image-text">
          {groupBy === 'country.name' || groupBy === 'representative.name'
            ? data[splitGroup[0]][splitGroup[1]]
            : data[groupBy]}
        </span>
      </React.Fragment>
    );
  };

  const header = renderHeader();
  const representativeFilterElement = renderRepresentativeFilter();
  const dateFilterElement = renderDateFilter();
  const statusFilterElement = renderStatusFilter();

  const { menuState } = useContext(vuroxContext);
  const toggleClass = menuState ? 'menu-closed' : 'menu-open';

  return (
    <Fragment>
      <Toast ref={toast}></Toast>
      <HeaderLayout className="sticky-top">{/* <HeaderDark /> */}</HeaderLayout>
      <VuroxLayout>
        <VuroxSidebar
          width={240}
          className={`sidebar-container  ${toggleClass}`}
        >
          {/* <Sidebar className={toggleClass} /> */}
        </VuroxSidebar>
        <ContentLayout className="p-4 vurox-scroll-y">
          <AntRow className="vurox-admin-content-top-section">
            <Col md={4}>
              <VuroxBreadcrumbs
                pagename="Data Grid"
                links={[
                  ['Home', '/', ''],
                  ['Application', '/'],
                  ['Data Grid', '/primereact', 'active'],
                ]}
              />
            </Col>
          </AntRow>
          <div className="datatable-doc-demo">
            <DataTable
              ref={dt}
              value={customers}
              header={header}
              className="w-100 p-datatable-customers p-datatable-sm"
              dataKey="id"
              resizableColumns
              columnResizeMode="expand"
              rowHover
              globalFilter={globalFilter}
              selection={selectedCustomers}
              onSelectionChange={(e) => setSelectedCustomers(e.value)}
              paginator
              rows={10}
              emptyMessage="No customers found"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              rowsPerPageOptions={[10, 25, 50]}
              reorderableColumns={true}
              onRowReorder={onRowReorder}
              onColReorder={onColReorder}
              stateStorage="custom"
              customSaveState={onCustomSaveState}
              customRestoreState={onCustomRestoreState}
              expandableRowGroups
              expandedRows={expandedRows}
              onRowToggle={(e) => setExpandedRows(e.data)}
              onRowExpand={onRowGroupExpand}
              onRowCollapse={onRowGroupCollapse}
              rowGroupMode="subheader"
              groupField={groupBy}
              rowGroupHeaderTemplate={headerTemplate}
              rowGroupFooterTemplate={() => <div />}
            >
              <Column
                key={'rowReorder'}
                columnKey={'rowReorder'}
                rowReorder
                style={{ width: '3em' }}
              />
              <Column
                key={'selection'}
                columnKey={'selection'}
                selectionMode="multiple"
                style={{ width: '3em' }}
              />
              {dynamicColumns}
            </DataTable>
          </div>
        </ContentLayout>
      </VuroxLayout>
    </Fragment>
  );
};

export default DataTableDemo;

export function getStaticProps() {
  return {
    props: {
      customers: [
        {
          id: 1196,
          name: 'Belen Strassner',
          country: {
            name: 'Ivory Coast',
            code: 'ci',
          },
          company: 'Eagle Software Inc',
          date: '2015-12-14',
          status: 'qualified',
          activity: 91,
          representative: {
            name: 'Xuxue Feng',
            image: '/images/site/dev_pp.png',
          },
        },
        {
          id: 1197,
          name: 'Vishal Marhatta',
          country: {
            name: 'Ivory Coast',
            code: 'ci',
          },
          company: 'Eagle Software Inc',
          date: '2015-12-14',
          status: 'qualified',
          activity: 91,
          representative: {
            name: 'Xuxue Feng',
            image: '/images/site/dev_pp.png',
          },
        },
        {
          id: 1198,
          name: 'Gracia Melnyk',
          country: {
            name: 'Costa Rica',
            code: 'cr',
          },
          company: 'Juvenile & Adult Super',
          date: '2019-06-01',
          status: 'unqualified',
          activity: 40,
          representative: {
            name: 'Asiya Javayant',
            image: '/images/site/dev_pp.png',
          },
        },
        {
          id: 1199,
          name: 'Jolanda Hanafan',
          country: {
            name: 'Cameroon',
            code: 'cm',
          },
          company: 'Perez, Joseph J Esq',
          date: '2015-12-09',
          status: 'qualified',
          activity: 27,
          representative: {
            name: 'Ivan Magalhaes',
            image: '/images/site/dev_pp.png',
          },
        },
      ],
    },
  };
}
