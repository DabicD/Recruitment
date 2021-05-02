//  Component that can display a table with footer.
//  Table has a possibility to fill missing data using described formulas.
//  It can also summary columns in footer using selected options.
//  Table content can be sorted when labels/header clicked.
//  (Sorting doesnt work well when mixed data-type occurs)
//
//  -----Attributes:-----
//
//  1. "fill-data-rules" - optional, describing formulas
//  separated by , sign to fill missing data in table.
//  If data cannot be filled by rule, it's name is swapped to 'NaN'.
//  (ex. '2=4/3', where number means column index)
//
//  2. "summary" - optional, describing type of aggregation
//  that will appear in footer.
//  (ex, 'none,count,count,avg,sum')
//
//  3. "columns" - mandatory, takes at least 1 argument.
//  Arguments need to be separated by , sign.
//  (ex. 'name,count,price')
//
//  4. "data" - mandatory, rows separated by ; sign 
//  and columns separated by , sign.
//  (ex. 'milk,12,2;butter,3,4')
//
//  Author:
//  Daniel  Dabic   -   01.05.2021
//
////////////////////////////////////////////////////

class TableComponent extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.reRender();
    }

    //  Attributes listener ----------------------
    static get observedAttributes() {
        return ['summary', 'data', 'columns', 'fill-data-rules'];
    }


    //  LIFE-CYCLE ----------------------

    attributeChangedCallback(name, oldValue, newValue) {
        this.reRender();
    }

    connectedCallback() {
    }

    disconnectedCallback() {
        this.destroy();
    }

    destroy() {
        //  Sorting func
        var thNodeArr = this.shadowRoot.querySelectorAll('th');
        var thArr = Array.prototype.slice.call(thNodeArr);
        thArr.map( (th, index) => 
            th.removeEventListener('click')
        );
        this.shadowRoot.innerHTML = '';
    }


    //  METHODS ----------------------

    //  Create table's content (+ add footer)
    tableData() {
        let dataStr = '';
        this.data.map( (jsonData) => 
            dataStr += this.tableRow(jsonData)
        );

        return dataStr + this.footer();
    }

    //  Create table's labels/header 
    tableLabels() {
        let labelsStr = '';
        this.columns.map( (label) => 
            labelsStr += `
                <th>
                    ${label}
                </th>`
        );

        return `<tr>
                    ${labelsStr}
                </tr>`;
    }

    //  Convert JSON into table's row
    tableRow(jsonData) {
        let rowStr = '';
        
        let colCount = this.columns.length;
        let index = 0;
        for(var key in jsonData) {
            if(colCount > index) {
            var value = jsonData[key];
            rowStr += `
                <td>
                    ${value}
                </td>`
            index++;
            }
        };

        return `<tr>
                    ${rowStr}
                </tr>`;
    }

    //  Convert attribute's data to array of JSONs and return [{},{},{}...]
    dataExtraction() {

        //  Data to arrays [][]
        const stringsArr = this.getAttribute('data').split(';');
        const data = stringsArr.map((jsonData) => jsonData.split(','));

        // Arrays to JSON {}
        let jsonArray = [];
        data.map( jsonData => {
            let jsonRow = {};
            //  Data shorter than columns = autofilled by 'x'
            for(let i=0; i < this.columns.length; i++)
                jsonRow[`${this.columns[i]}`] = 'x';

            let index = 0;
            jsonData.map( (element) => {
                if(index < this.columns.length)
                jsonRow[`${this.columns[index++]}`] = element;
            })
            jsonArray.push(jsonRow);
        })
        return jsonArray;
    }

    //  Extract rules to array and return []
    rulesExtraction() {
        return this.getAttribute('fill-data-rules').split(',');
    }

    //  Extract columns to array and return []
    columnsExtraction() {
        return this.getAttribute('columns').split(',');
    }

    //  Extract summary to array and return []
    summaryExtraction() {
        return this.getAttribute('summary').split(',');
    }

    // Sorting data [A-Z]
    sortingData(index) {
        let tempData = this.data;

        //  Checking type (string or number) to provide good sorting
        let someTempOfData = tempData[0][`${this.columns[index]}`];
        let strSort = isNaN(someTempOfData);

        //  String sorting
        if(strSort) {
            tempData.sort( (a, b) => {
                return (
                    a[`${this.columns[index]}`].toLowerCase()
                    <
                    b[`${this.columns[index]}`].toLowerCase())
                    ? -1 : 1;
            });

        //  Number sorting
        } else {
            tempData.sort( (a, b) => {
                return (
                    Number.parseFloat(a[`${this.columns[index]}`])
                    >
                    Number.parseFloat(b[`${this.columns[index]}`]))
                    ? -1 : 1;
            });
        }

        this.data = tempData;

        //  Refresh
        this.tableFunc()
    }

    //  Table Create/refresh table and set sorting listener
    tableFunc() {
        this.shadowRoot.innerHTML = `
            <table>
            `+ this.tableLabels() +`
            `+ this.tableData() +`
            </table>`;

        //  Sorting listener
        this.sortingList();
    }

    //  add onclick listener on header/labels 
    sortingList() {
        var thNodeArr = this.shadowRoot.querySelectorAll('th');
        var thArr = Array.prototype.slice.call(thNodeArr);
        thArr.map( (th, index) => 
            th.addEventListener('click', () => this.sortingData(index))
        );
    }

    //  Render method.
    reRender() {
        
        //  Data operations
        if( this.validateColumns() ){
            this.columns = this.columnsExtraction();

            if( this.validateSummary() )
                this.summary = this.summaryExtraction();

            if( this.validateData() ) {
                this.data = this.dataExtraction();
                this.data.forEach(this.fillEmptyValues);
                
                if( this.validateRules() ) {
                    this.rules = this.rulesExtraction();

                    //  Executing rules, filling missing data. (if possible)
                    this.rulesFunc();
                }
                //  Table creation
                this.tableFunc();

            } else {
                this.shadowRoot.innerHTML = `<h4> Cannot display table without any data</h4>`;
            }
        } else {
            this.shadowRoot.innerHTML = `<h4> Cannot display table without at least a single column</h4>`;
        }
    }
    
    //  Return result of passed summary's method on all data from selected label.
    summaryFunc(str, label) {
        let summaryStr = '-----'

        switch(str) {

            //  Count of unique values. (emptyValues and 'x' excluded)
            case 'count':
                const mySet = new Set();
                this.data.map( (jsonData) => {
                    let temp = jsonData[label];
                    if(temp !== 'x' && temp)
                        mySet.add(jsonData[label]);
                })
                summaryStr = mySet.size;
                break;

            // Avarange of values. (emptyValues and 'x' excluded, sum of strings return 'NaN')
            // Float precision is set to 3. (ex. 1.2345 => 1.234)
            case 'avg':
                let avg = this.sumOfData(label) / this.lengthOfData(label);
                if( !isNaN(avg) ) {
                    !Number.isInteger(avg) 
                    ? 
                    summaryStr = avg.toFixed(3)
                    :
                    summaryStr = avg
                } else {
                    summaryStr = 'NaN';
                }
                break;
            
            //  Sum of values. (emptyValues and 'x' excluded, sum of strings return 'NaN')
            case 'sum':
                let sum = this.sumOfData(label);
                !isNaN(sum) 
                ? 
                    summaryStr = sum
                :
                    summaryStr = 'NaN'
                break;
            
            case 'none':
                break;

            default:
                if(!typeof str === undefined)
                    console.log('Warning_table-component: Your summary attribute is wrongly written');
        }
        return summaryStr;
    }

    //  Return complete code to create footer that include summary.
    footer() {
        let rowStr = '';
        let index = 0;
        this.columns.map( (label) => {
            rowStr += `
                <td>
                    ${ this.summaryFunc(this.summary[index++], label) }
                </td>`;
        });
        return `<tr>
                    ${rowStr}
                </tr>`;
    }

    //  Put 'x' to emptyValues
    fillEmptyValues(jsonData, index) {
        for(let element in jsonData) {
            if(!jsonData[`${element}`])
                jsonData[`${element}`] = 'x';
        }
    }

    //  Return sum of all data from selected label or NaN
    sumOfData(label) {
        let sum = 0;
        this.data.map( (jsonData) => {
            let temp = jsonData[`${label}`];
            if(temp && temp !== 'x') {
                sum += parseFloat(temp);
            }
        });
        return sum;
    }

    //  Return length of data ( emptyValues and 'x' are excluded)
    lengthOfData(label) {
        let length = 0;
        this.data.map( jsonData => {
            let temp = jsonData[`${label}`];
            if(temp && temp !== 'x')
                length++;
        });
        return length;
    }

    //  Execute rules if possible.
    rulesFunc() {
        let warn1 = false;

        this.rules.map( (rule) => {
            let tempArr = rule.split('=');
            this.data.map( (jsonData, index) => {

                //  Checking there is empty or 'x' value inside this column in data
                let labelName = this.columns[ tempArr[0] ];
                let dataValue = jsonData[`${labelName}`];
                let formulaStr = '';
                if(!dataValue || dataValue === 'x') {

                    try {
                        // Create formula
                        for(let element of tempArr[1]) {

                            //  Number
                            if( !isNaN(element) ){
                                let labelName = this.columns[Number.parseInt(element)];
                                let dataValue = jsonData[`${labelName}`];
                                formulaStr += dataValue;
                            
                            //  !Number
                            } else {
                                formulaStr += element;
                            }
                        }
                    } catch(err) {
                        //  Empty tempArr[1] scenario
                        formulaStr = 'x';
                    }

                    //  Resault
                    try{
                        let result;
                        result = eval(formulaStr);
                        if(result === '')
                            result = 'x';
                        jsonData[`${labelName}`] = result + '';

                    } catch(err) {
                        // Scenario: Some of the rules cannot be executed (ex. value = string)
                        // We dont need to touch it, just prevent eval error.
                    }
                } else {
                    // Scenario: fill-data-rules is a number
                    warn1 = true;
                }

            });
        });
    }

    //  Validations --------------------------------------
    validateSummary() {
        if(this.getAttribute('summary') === null) {
            this.summary = [];
            return false;
        }
        return true;
    }

    validateRules() {
        if(this.getAttribute('fill-data-rules') === null) {
            this.rules = [];
            return false;
        }
        return true;
    }

    validateData() {
        let dataStr = this.getAttribute('data');
        if(dataStr === null) {
            this.data = [];
            return false;
        }
        return true;
    }

    validateColumns() {
        let colStr = this.getAttribute('columns');
        if(colStr === null || colStr === '') {
            this.columns = [];
            return false;
        }
        return true;
    }
}

customElements.define('table-component', TableComponent);