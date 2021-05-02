##Webcomponents Exercise

Write webcomponent that will display a simple table. 

Webcomponent should consume attributes:  

- `columns` **mandatory attribute/minimum of 1 column** - header columns separated with `,` sign
- `data` **mandatory attribute** - rows separated by `;` sign and columns separated by `,` sign
- `summary` **optional attribute** - footer columns describing type of aggregation to use as described below:
  - `count`: count of unique items
  - `avg`: average of values
  - `sum`: sum of values
  - `none`: display hyphen sign
- `fill-data-rules` **optional attribute**- describing formulas separated by `,` sign for filling the data where number means column index
  - eg. `2=4/3` means `Quantity=Total value/Unit Price` and so on

---  

Dummy structure is prepared inside `index.html`.  
Use and edit `table-component.js` as you please to fulfill goal of this exercise.    
Try the write webcomponent that will be as generic and flexible as you can so displaying different data set would not be a problem.    
Also it is recommended that you could change attributes on the fly and table should print new data.  
Add attributes validation if necessary and print information that table cannot be displayed with reason (eg. `columns` attribute should have at least single column name).  
Keep in mind that CustomElements are not supported in all browsers: [CanIUseCheck](https://caniuse.com/#search=components).

###Extra points for:

- In the footer of the table, fill missing cells with formulas passed as an attribute.
- Reading table data from CSV or JSON file instead of string.  
Instead of passing data as string `data="a,b,c;d,e,f"` try to read data from file and use relative path eg: `data="./data.csv"` or `data="./data.json"`.
- On header of the table add listening on mouse click for sorting the data.

###Table from current attributes should look like:


Title | Author | Quantity | Unit Price | Total value
--- | --- | --- | --- | ---
Captain Tripps | S. King | 10 | 9 | x
American Nightmares | S. King | x | 10 | 40
Soul Survivors | S. King | 8 | x | 96
Hardcases | S. King | 13 | 23 | x
No Man’s Land | S. King | x | 25 | 50
The Night Has Come | S. King | 30 | x | 900
The Sphinx | Graham Masterton | 3 | x | 300
Charnel House | Graham Masterton | x | 20 | 60
The Devils of D-Day | Graham Masterton | 10 | 16 | x
-----|-----|-----|-----|-----
- | x | x | - | x


#Good luck! 