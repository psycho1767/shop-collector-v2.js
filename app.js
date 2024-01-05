const fs2 = require('fs').promises;
const fs = require('fs')
const { Builder, By, Key, until } = require('selenium-webdriver');
const driver = new Builder().forBrowser('chrome').build();
const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Sheet1');

let links = Array.from({length:51},(_,i) => `https://balad.ir/city-qom/cat-clothing-store?page=${i+1}#12.13/34.63905/50.90309`)
// let link = 'https://balad.ir/city-gorgan/cat-clothing-store?page=1#12.34/36.83237/54.4759'

let linkslist = []

async function start() {

    for(let link of links){
        try{
            await driver.get(link);
        
            await driver.executeScript('document.body.style.zoom = "0.25"');
            let items = await driver.findElements(By.css('.BundleItem_item__content__3l8hl'))
            let rund=0;
            while (items.length < 10){
                if(links.indexOf(link) == 9){
                    items = await driver.findElements(By.css('.BundleItem_item__content__3l8hl'))
                    break
                }
                items = await driver.findElements(By.css('.BundleItem_item__content__3l8hl'))
                if(rund>50){
                    break
                }
                rund+=1
            }
            let Ellinks = []
            for(elems of items){ 
                let attr = await elems.getAttribute('href')
                Ellinks.push(attr)
            }
            let elementlinks = [...new Set(Ellinks)];
            linkslist.push(elementlinks)
        }catch{
        }
    }
    let old;
    fs.readFile('links.json', 'utf-8', async (err,data)=>{
        old = JSON.parse(data);
    })
    linkslist.shift(old)
    linkslist = linkslist.flatMap(itemlist => itemlist)
    linkslist = JSON.stringify(linkslist)
    fs.writeFileSync('links.json', linkslist)
}

// start();
openlinks()

async function openlinks(){
    const data = await fs2.readFile('links.json', 'utf-8');
    const jsonlinks = await JSON.parse(data);
    let forxl = []
    for (href of jsonlinks) {
        try {
            await driver.get(href);
    
            let eltarget = await driver.findElements(By.css('.DynamicFields_link__Q9QHY'));
    
            if (eltarget.length > 0) {
                let headname = await driver.findElement(By.tagName('bdi'));
                headname = await headname.getText();
                let elemdata = [headname];
    
                for (target of eltarget) {
                    let attr = await target.getAttribute('href');
                    elemdata.push(attr);
                }
    
                elemdata[1] = elemdata[1].slice(6);
                forxl.push(elemdata);
            }
        } catch (error) {
            console.error("number nadare");
        }
    }
    
    await writer(forxl)
}


async function writer(list){
    for(element of list){
        let needadd = Array.from({length:6},(_,i)=>i)
        needadd[0] = element[0]
        element.shift()
        let round = 0;
        while (element.length !== 0) {
            if(round > 15){
                break
            }
            round+=1
            for(item of element){
                if(acn(item)){
                    needadd[1] = item
                    element.splice(element.indexOf(item),1)
                }else{
                    if(needadd[1] == 1)
                        needadd[1] = ''
                }
                if(item.includes('wa.me')){
                    needadd[2]=item
                    element.splice(element.indexOf(item),1)
                }else{
                    if(needadd[2] == 2)
                        needadd[2]=''
                }
                if(item.includes('t.me')){
                    needadd[3]=item
                    element.splice(element.indexOf(item),1)
                }else{
                    if(needadd[3] == 3)
                        needadd[3]=''
                }
                if(item.includes('instagram')){
                    needadd[4]=item
                    element.splice(element.indexOf(item),1)
                }else{
                    if(needadd[4] == 4)
                        needadd[4]=''
                }
                if(!item.includes('wa.me') && !item.includes('t.me') && !item.includes('instagram') && item.includes('.com')){
                    needadd[5]=item
                    element.splice(element.indexOf(item),1)
                }else{
                    if(needadd[5] == 5)
                        needadd[5]=''
                }
            }
            
        }
        if(needadd.length == 6)        
            worksheet.addRow(needadd)
    };
    await workbook.xlsx.writeFile('qom-lebas-foroshi.xlsx')
}


function acn(str) {
    for (let i = 0; i < str.length; i++) {
      if (isNaN(parseInt(str[i]))) {
        return false;
      }
    }
    return true;
  }



// [
//     'بوتیک فرشتگان',
//     '09121067992',
//     'http://pooshiran.com',
//     'https://wa.me/+989121067992',
//     'https://t.me/Meghdadk',
//     'https://instagram.com/Fereshtegan.mk'
// ]
// https://balad.ir/p/%D8%A8%D9%88%D8%AA%DB%8C%DA%A9-%D9%81%D8%B1%D8%B4%D8%AA%DA%AF%D8%A7%D9%86_clothing-store-15nDgcKLnCevmc#15/36.83552/54.44294

// https://balad.ir/p/%D9%81%D8%B1%D9%88%D8%B4%DA%AF%D8%A7%D9%87-%D9%84%D8%A7%D9%87%DB%8C%D8%AC%D8%A7%D9%86%DB%8C%D8%A7%D9%86-tehran-nei-bazar_clothing-store-1yDzHA9dNtC6Wy